import { useEffect, useMemo, useState } from "react";
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

const NoticeDetail = ({ id, onClose }: Props) => {
    const [notice, setNotice] = useState<NoticeDetailDto | null>(null);
    const [processedHtml, setProcessedHtml] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const apiBase = useMemo(() => import.meta.env.VITE_API_BASE_URL, []);

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
                };
                setNotice(mapped);
                setError(null);
                const html = mapped.has_attachment && isEmptyHtml(mapped.content) ? "" : transformHtml(mapped.content ?? "");
                setProcessedHtml(html);
            })
            .catch((err) => {
                console.error("❌ 공지 상세 불러오기 실패:", err);
                setError("상세 내용을 불러오는 데 실패했습니다.");
            });
    }, [apiBase, id]);

    useEffect(() => {
        const container = document.getElementById("notice-content");
        if (!container) return;

        const originalWindowOpen = window.open;
        window.open = (...args: any[]) => null;
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
                    if (m.target instanceof HTMLElement && m.target.matches("a, [role='link']")) {
                        disableOne(m.target);
                    }
                }
            });
        });
        mo.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ["href", "role", "onclick", "target"] });

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

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.currentTarget === e.target) onClose();
    };

    if (error) return <div>{error}</div>;
    if (!notice) return <div />;

    const showInline = !(notice.has_attachment && isEmptyHtml(notice.content));

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.backButton} onClick={onClose}>
                    X
                </button>
                <h2>{notice.title}</h2>
                {notice.createdAt && <p className={styles.createdAt}>{notice.createdAt}</p>}
                <hr />
                {showInline ? (
                    <div id="notice-content" className={styles.modalNoticeContent} dangerouslySetInnerHTML={{ __html: processedHtml }} />
                ) : (
                    <p className={styles.modalNoticeMessage}>웹에서 확인해주세요 (첨부파일 있음)</p>
                )}
            </div>
            <div className={styles.qrContainer} onClick={(e) => e.stopPropagation()}>
                <p>&nbsp; 모바일에서 확인하려면 QR을 스캔하세요</p>
                <QRCode value={`${window.location.origin}/notice/${notice.id}`} size={128} />
            </div>
        </div>
    );
};

export default NoticeDetail;
