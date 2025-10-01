import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./NoticeDetail.module.css";
import QRCode from "react-qr-code";
import koglIconUrl from "../../../assets/img_opentype04.png";

type Props = { id: string; onClose: () => void };

type NoticeDetailDto = {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    has_attachment: boolean;
    url?: string;
};

const KOGL_TEXT = "공공누리 제4유형: 출처표시 + 상업적 이용금지 + 변경금지";
const KOGL_ICON = koglIconUrl;

function isEmptyHtml(html: string | null | undefined): boolean {
    if (!html) return true;
    const stripped = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").replace(/\s/g, "");
    return stripped === "";
}

function transformHtml(raw: string): string {
    const doc = document.implementation.createHTMLDocument("notice");
    const root = doc.createElement("div");
    root.innerHTML = raw ?? "";

    root.querySelectorAll("img").forEach((img) => {
        img.setAttribute("loading", "lazy");
        img.classList.add(styles.responsiveImg);
    });
    root.querySelectorAll("iframe, video, object, embed").forEach((el) => {
        (el as HTMLElement).classList.add(styles.responsiveMedia);
    });
    root.querySelectorAll<HTMLAnchorElement>("a[href$='.pdf']").forEach((a) => {
        const href = a.getAttribute("href") || "";
        if (!href) return;
        if (a.closest(`.${styles.pdfEmbed}`)) return;
        const wrap = doc.createElement("div");
        wrap.className = styles.pdfEmbed;
        const iframe = doc.createElement("iframe");
        iframe.setAttribute("src", href);
        iframe.setAttribute("title", "PDF 미리보기");
        iframe.setAttribute("loading", "lazy");
        const caption = doc.createElement("div");
        caption.className = styles.pdfCaption;
        caption.textContent = a.textContent || href.split("/").pop() || "PDF";
        wrap.appendChild(iframe);
        wrap.appendChild(caption);
        a.replaceWith(wrap);
    });

    const kogl = doc.createElement("div");
    kogl.className = styles.koglBadge;
    const iconImg = doc.createElement("img");
    iconImg.src = KOGL_ICON;
    iconImg.alt = "공공누리 제4유형";
    iconImg.className = styles.koglIcon;
    (iconImg as any).onerror = () => ((iconImg as any).style = "display:none;");
    const text = doc.createElement("span");
    text.className = styles.koglText;
    text.textContent = KOGL_TEXT;
    kogl.appendChild(iconImg);
    kogl.appendChild(text);
    root.appendChild(kogl);

    return root.innerHTML;
}

const PAGE_STEP_RATIO = 0.85;
function collectHeadings(root: HTMLElement | null): HTMLElement[] {
    if (!root) return [];
    return Array.from(root.querySelectorAll("h1, h2, h3, .section, [data-section='true']"))
        .filter((el) => (el as HTMLElement).offsetParent !== null) as HTMLElement[];
}

const NoticeDetail = ({ id, onClose }: Props) => {
    const [notice, setNotice] = useState<NoticeDetailDto | null>(null);
    const [processedHtml, setProcessedHtml] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [progress, setProgress] = useState(0);
    const [showTop, setShowTop] = useState(false);
    const [headings, setHeadings] = useState<HTMLElement[]>([]);
    const holdTimer = useRef<number | null>(null);
    const apiBase = useMemo(() => import.meta.env.VITE_API_BASE_URL, []);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const url = `${apiBase}notice/mobile/${id}`;
        fetch(url, { headers: { Accept: "application/json" } })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                return res.json();
            })
            .then((data) => {
                const mapped: NoticeDetailDto = {
                    id: data.id,
                    title: data.title,
                    content: data.content,
                    createdAt: data.createdAt || data.created_at || "",
                    has_attachment: data.has_attachment,
                    url: data.url,
                };
                setNotice(mapped);
                setError(null);
                const html =
                    mapped.has_attachment && isEmptyHtml(mapped.content)
                        ? ""
                        : transformHtml(mapped.content ?? "");
                setProcessedHtml(html);
            })
            .catch(() => {
                setError("상세 내용을 불러오는 데 실패했습니다.");
            });
    }, [apiBase, id]);

    useEffect(() => {
        const container = document.getElementById("notice-content");
        if (!container) return;
        const originalWindowOpen = window.open;
        window.open = (..._args: any[]) => null;
        const blockNav = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };
        window.addEventListener("beforeunload", blockNav);
        const styleEl = document.createElement("style");
        styleEl.textContent = `
      #notice-content a,
      #notice-content [role="link"] {
        pointer-events: none !important;
        color: gray !important;
        text-decoration: none !important;
        cursor: default !important;
      }
    `;
        container.appendChild(styleEl);

        const disableOne = (el: Element) => {
            if (!(el instanceof HTMLElement)) return;
            const isAnchor = el.tagName === "A";
            const isRoleLink = el.getAttribute("role") === "link";
            if (!isAnchor && !isRoleLink) return;
            el.removeAttribute("href");
            el.removeAttribute("target");
            el.removeAttribute("rel");
            el.removeAttribute("onclick");
            el.removeAttribute("onmousedown");
            el.removeAttribute("onmouseup");
            el.setAttribute("aria-disabled", "true");
            el.setAttribute("tabindex", "-1");
            (el as any).onclick = (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
            };
        };
        const disableAll = (root: ParentNode) => {
            root.querySelectorAll("a, [role='link']").forEach(disableOne);
        };
        disableAll(container);

        const mo = new MutationObserver((mutations) => {
            mutations.forEach((m) => {
                if (m.type === "childList") {
                    m.addedNodes.forEach((node) => {
                        if (!(node instanceof HTMLElement)) return;
                        if (node.matches("a, [role='link']")) disableOne(node);
                        disableAll(node);
                    });
                } else if (m.type === "attributes") {
                    if (
                        m.target instanceof HTMLElement &&
                        m.target.matches("a, [role='link']")
                    ) {
                        disableOne(m.target);
                    }
                }
            });
        });
        mo.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["href", "role", "onclick", "target"],
        });

        const captureBlocker = (e: Event) => {
            const t = e.target as HTMLElement | null;
            if (t && (t.closest("a") || t.closest("[role='link']"))) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        container.addEventListener("click", captureBlocker, true);
        container.addEventListener("mousedown", captureBlocker, true);
        container.addEventListener("mouseup", captureBlocker, true);
        container.addEventListener("auxclick", captureBlocker, true);
        container.addEventListener("touchstart", captureBlocker, true);
        container.addEventListener("touchend", captureBlocker, true);
        container.addEventListener("contextmenu", captureBlocker, true);

        return () => {
            mo.disconnect();
            container.removeEventListener("click", captureBlocker, true);
            container.removeEventListener("mousedown", captureBlocker, true);
            container.removeEventListener("mouseup", captureBlocker, true);
            container.removeEventListener("auxclick", captureBlocker, true);
            container.removeEventListener("touchstart", captureBlocker, true);
            container.removeEventListener("touchend", captureBlocker, true);
            container.removeEventListener("contextmenu", captureBlocker, true);
            styleEl.remove();
            window.removeEventListener("beforeunload", blockNav);
            window.open = originalWindowOpen;
        };
    }, [processedHtml]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onScroll = () => {
            const max = el.scrollHeight - el.clientHeight;
            const p = max > 0 ? (el.scrollTop / max) * 100 : 0;
            setProgress(p);
            setShowTop(el.scrollTop > 200);
        };
        el.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => el.removeEventListener("scroll", onScroll);
    }, [processedHtml]);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (!scrollRef.current) return;
            if (e.key === "PageDown") {
                e.preventDefault();
                scrollByPage(1);
            } else if (e.key === "PageUp") {
                e.preventDefault();
                scrollByPage(-1);
            } else if (e.key === "ArrowRight" && (e.altKey || e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                goToNextHeading(1);
            } else if (e.key === "ArrowLeft" && (e.altKey || e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                goToNextHeading(-1);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [onClose]);

    useEffect(() => {
        const root = document.getElementById("notice-content");
        setHeadings(collectHeadings(root));
    }, [processedHtml]);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.currentTarget === e.target) onClose();
    };

    const scrollByPage = (dir: 1 | -1) => {
        const el = scrollRef.current;
        if (!el) return;
        const delta = dir * Math.floor(el.clientHeight * PAGE_STEP_RATIO);
        el.scrollBy({ top: delta, behavior: "smooth" });
    };

    const goToNextHeading = (dir: 1 | -1) => {
        const el = scrollRef.current;
        const root = document.getElementById("notice-content");
        if (!el || !root) return;
        const list = headings.length ? headings : collectHeadings(root);
        if (!list.length) {
            scrollByPage(dir);
            return;
        }
        const currentTop = el.scrollTop;
        const viewportBottom = currentTop + el.clientHeight;
        if (dir === 1) {
            const target = list.find((h) => h.offsetTop > viewportBottom - 8);
            if (target) el.scrollTo({ top: target.offsetTop - 8, behavior: "smooth" });
            else el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        } else {
            const prevs = list.filter((h) => h.offsetTop < currentTop - 8);
            const target = prevs[prevs.length - 1];
            if (target) el.scrollTo({ top: target.offsetTop - 8, behavior: "smooth" });
            else el.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const startHold = (action: () => void) => {
        action();
        stopHold();
        holdTimer.current = window.setInterval(action, 220);
    };
    const stopHold = () => {
        if (holdTimer.current) {
            clearInterval(holdTimer.current);
            holdTimer.current = null;
        }
    };

    if (error) return <div>{error}</div>;
    if (!notice) return <div />;

    const showInline = !(notice.has_attachment && isEmptyHtml(notice.content));

    const linkUrl = (() => {
        const raw = (notice.url ?? "").trim();
        if (!raw) return `${window.location.origin}/notice/${notice.id}`;
        try {
            return new URL(raw, apiBase).toString();
        } catch {
            return raw;
        }
    })();


    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <button className={styles.headerBtn} onClick={onClose}>닫기</button>
                    <div className={styles.headerMain}>
                        <h2 className={styles.title}>{notice.title}</h2>
                        {notice.createdAt && <p className={styles.createdAt}>{notice.createdAt}</p>}
                    </div>
                    <div className={styles.headerTools}>
                        <div className={styles.zoomGroup}>
                            <button aria-label="작게" onClick={() => setZoom((z) => Math.max(0.8, +(z - 0.1).toFixed(2)))}>−</button>
                            <span>{Math.round(zoom * 100)}%</span>
                            <button aria-label="크게" onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.1).toFixed(2)))}>+</button>
                        </div>
                        <a
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.qrMini}
                            title="상세 원문 페이지 열기"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <QRCode value={linkUrl} size={64} />
                        </a>
                    </div>

                    <div className={styles.progressTrack}>
                        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className={styles.contentArea} ref={scrollRef}>
                    <div style={{ fontSize: `${1.5 * zoom}rem`, lineHeight: 1.6 }}>
                        {showInline ? (
                            <div
                                id="notice-content"
                                className={styles.modalNoticeContent}
                                dangerouslySetInnerHTML={{ __html: processedHtml }}
                            />
                        ) : (
                            <p className={styles.modalNoticeMessage}>웹에서 확인해주세요 (첨부파일 있음)</p>
                        )}
                    </div>
                </div>

                <div className={styles.floatDock}>
                    <button
                        className={`${styles.scrollTopBtn} ${showTop ? "" : styles.scrollTopBtnHidden}`}
                        onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                        aria-label="맨 위로"
                    >
                        Top
                    </button>
                    <div className={styles.manualScrollRail} aria-hidden>
                        <button
                            className={styles.railBtn}
                            title="위로 한 페이지"
                            onMouseDown={() => startHold(() => scrollByPage(-1))}
                            onMouseUp={stopHold}
                            onMouseLeave={stopHold}
                            onTouchStart={() => startHold(() => scrollByPage(-1))}
                            onTouchEnd={stopHold}
                        >
                            Pg↑
                        </button>
                        <button
                            className={styles.railBtn}
                            title="아래로 한 페이지"
                            onMouseDown={() => startHold(() => scrollByPage(1))}
                            onMouseUp={stopHold}
                            onMouseLeave={stopHold}
                            onTouchStart={() => startHold(() => scrollByPage(1))}
                            onTouchEnd={stopHold}
                        >
                            Pg↓
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoticeDetail;
