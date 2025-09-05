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
const DEBUG = true;

function isEmptyHtml(html: string | null | undefined): boolean {
    if (!html) return true;
    const stripped = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").replace(/\s/g, "");
    return stripped === "";
}

function transformHtml(raw: string): string {
    const doc = document.implementation.createHTMLDocument("notice");
    const root = doc.createElement("div");
    root.innerHTML = raw ?? "";

    const norm = (s: string) =>
        (s || "")
            .replace(/<br\s*\/?>/gi, "")
            .replace(/&nbsp;/g, "")
            .replace(/\s+/g, "")
            .replace(/[\u200B-\u200D\uFEFF]/g, "")
            .trim();
    const getPText = (el: Element) => norm(el.textContent || "");

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

    const HEADER_SETS: string[][] = [
        ["학년", "학기", "교과구분", "이수구분", "교과코드", "교과목명", "학점", "시수", "복수전공", "부전공", "이론", "실습"],
        ["학과", "수강 제한 교과목"],
    ];

    const pNodes = Array.from(root.querySelectorAll("p")).filter((p) => !p.closest("table"));

    if (DEBUG) {
        console.groupCollapsed("[NoticeDetail] pNodes (원본 <p> 목록)");
        pNodes.forEach((p, i) => {
            console.log(i, { text: (p.textContent || "").trim(), html: p.outerHTML });
        });
        console.groupEnd();
    }

    const indexMap = new Map<Element, number>();
    pNodes.forEach((el, i) => indexMap.set(el, i));

    function matchHeaderAt(start: number, header: string[]): number | null {
        let i = start;
        for (let j = 0; j < header.length; j++) {
            while (i < pNodes.length && getPText(pNodes[i]) === "") i++;
            if (i >= pNodes.length) return null;
            if (getPText(pNodes[i]) !== norm(header[j])) return null;
            i++;
        }
        return i;
    }

    const isHeaderStartIdx = (idx: number) => {
        for (const h of HEADER_SETS) {
            const matched = matchHeaderAt(idx, h);
            if (matched != null) return true;
        }
        return false;
    };

    type Block = { headerStart: number; dataStart: number; header: string[] };
    const headerBlocks: Block[] = [];
    for (const header of HEADER_SETS) {
        for (let i = 0; i < pNodes.length; i++) {
            const dataStart = matchHeaderAt(i, header);
            if (dataStart != null) {
                headerBlocks.push({ headerStart: i, dataStart, header });
                i = dataStart - 1;
            }
        }
    }

    headerBlocks.sort((a, b) => b.headerStart - a.headerStart);

    if (DEBUG) {
        console.groupCollapsed("[NoticeDetail] 헤더 블록 감지 결과");
        headerBlocks.forEach((b, i) => {
            console.log(i, {
                header: b.header,
                headerStart: b.headerStart,
                dataStart: b.dataStart,
                headerPreview: b.header.join("|"),
                at: pNodes.slice(b.headerStart, b.dataStart).map(getPText),
            });
        });
        console.groupEnd();
    }

    for (const { headerStart, dataStart, header } of headerBlocks) {
        const colCount = header.length;

        const wrap = doc.createElement("div");
        wrap.className = styles.tableWrap;
        const table = doc.createElement("table");
        table.classList.add(styles.table);
        const thead = doc.createElement("thead");
        const headTr = doc.createElement("tr");
        header.forEach((h) => {
            const th = doc.createElement("th");
            th.textContent = h;
            headTr.appendChild(th);
        });
        thead.appendChild(headTr);
        table.appendChild(thead);
        const tbody = doc.createElement("tbody");
        table.appendChild(tbody);
        wrap.appendChild(table);

        const headerPs: Element[] = [];
        {
            let scan = headerStart;
            let j = 0;
            while (scan < dataStart && j < header.length) {
                const t = getPText(pNodes[scan]);
                if (t === "") {
                    scan++;
                    continue;
                }
                if (t === norm(header[j])) {
                    headerPs.push(pNodes[scan]);
                    j++;
                }
                scan++;
            }
        }

        let anchorP: Element | null = null;
        if (headerPs.length) {
            anchorP = headerPs[0];
        } else {
            for (let i = headerStart; i < Math.min(dataStart, pNodes.length); i++) {
                if (getPText(pNodes[i]) !== "") {
                    anchorP = pNodes[i];
                    break;
                }
            }
            if (!anchorP) {
                if (DEBUG) console.warn("[NoticeDetail] 표 앵커를 찾지 못해 스킵:", { headerStart, dataStart, header });
                continue;
            }
        }

        if (DEBUG) {
            console.groupCollapsed("[NoticeDetail] 테이블 생성 시작");
            console.log("헤더:", header.join(" | "));
            console.log("데이터 시작 인덱스:", dataStart, "열 수:", colCount);
            console.log("앵커:", anchorP);
            console.groupEnd();
        }

        let idx = dataStart;
        while (idx < pNodes.length) {
            let probe = idx;
            while (probe < pNodes.length && getPText(pNodes[probe]) === "") probe++;
            if (probe < pNodes.length) {
                const probeEl = pNodes[probe];
                const probeIdx = indexMap.get(probeEl);
                if (probeIdx != null && isHeaderStartIdx(probeIdx)) break;
            }

            while (idx < pNodes.length && getPText(pNodes[idx]) === "") idx++;
            if (idx < pNodes.length && /합계/.test(getPText(pNodes[idx]))) {
                const sumLabel = getPText(pNodes[idx]);
                idx++;
                while (idx < pNodes.length && getPText(pNodes[idx]) === "") idx++;
                const sumVal = idx < pNodes.length ? getPText(pNodes[idx]) : "";
                if (sumVal) idx++;
                const tr = doc.createElement("tr");
                const td = doc.createElement("td");
                td.colSpan = colCount;
                td.textContent = sumVal ? `${sumLabel} ${sumVal}` : sumLabel;
                tr.appendChild(td);
                tbody.appendChild(tr);
                if (DEBUG) console.log("합계 행:", td.textContent);
                continue;
            }

            const row: string[] = [];
            while (idx < pNodes.length && row.length < colCount) {
                const t = getPText(pNodes[idx]);
                const el = pNodes[idx];
                idx++;
                if (t === "") continue;
                const curIdx = indexMap.get(el);
                if (row.length === 0 && curIdx != null && isHeaderStartIdx(curIdx)) {
                    idx--;
                    break;
                }
                row.push(t);
            }
            if (!row.length) break;
            while (row.length < colCount) row.push("");
            const tr = doc.createElement("tr");
            row.forEach((v) => {
                const td = doc.createElement("td");
                td.textContent = v;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
            if (DEBUG) console.log("행:", row);
        }

        anchorP.replaceWith(wrap);

        headerPs.forEach((p) => {
            try {
                p.remove();
            } catch {}
        });

        let cursor = wrap.nextElementSibling;
        while (cursor && cursor.tagName.toLowerCase() === "p") {
            const mappedIdx = indexMap.get(cursor);
            if (mappedIdx != null && isHeaderStartIdx(mappedIdx)) break;
            const next = cursor.nextElementSibling;
            cursor.remove();
            cursor = next;
        }
    }

    if (DEBUG) {
        const tableCnt = root.querySelectorAll("table").length;
        console.log("[NoticeDetail] 변환 후 table 수:", tableCnt);
        console.log("[NoticeDetail] '<table>' 포함?", root.innerHTML.includes("<table"));
    }

    const looseCells = Array.from(root.querySelectorAll("th, td")).filter((cell) => !cell.closest("table"));
    if (looseCells.length) {
        const parents = Array.from(new Set(looseCells.map((c) => c.parentElement).filter(Boolean))) as HTMLElement[];
        parents.forEach((parent) => {
            const cells = Array.from(parent.querySelectorAll(":scope > th, :scope > td"));
            if (!cells.length) return;
            const tableWrap = doc.createElement("div");
            tableWrap.className = styles.tableWrap;
            const table = doc.createElement("table");
            table.classList.add(styles.table);
            const tbody = doc.createElement("tbody");
            const tr = doc.createElement("tr");
            cells.forEach((c) => tr.appendChild(c));
            tbody.appendChild(tr);
            table.appendChild(tbody);
            tableWrap.appendChild(table);
            parent.replaceWith(tableWrap);
        });
    }

    const kogl = doc.createElement("div");
    kogl.className = styles.koglBadge;
    const iconImg = doc.createElement("img");
    iconImg.src = KOGL_ICON;
    iconImg.alt = "공공누리 제4유형";
    iconImg.className = styles.koglIcon;
    iconImg.onerror = () => ((iconImg as any).style = "display:none;");
    const text = doc.createElement("span");
    text.className = styles.koglText;
    text.textContent = KOGL_TEXT;
    kogl.appendChild(iconImg);
    kogl.appendChild(text);
    root.appendChild(kogl);

    if (DEBUG) {
        console.groupCollapsed("[NoticeDetail] 최종 HTML (일부 미리보기)");
        const preview = root.innerHTML.slice(0, 800);
        console.log(preview + (root.innerHTML.length > 800 ? " ...[더 있음]" : ""));
        console.groupEnd();
    }

    return root.innerHTML;
}

const NoticeDetail = ({ id, onClose }: Props) => {
    const [notice, setNotice] = useState<NoticeDetailDto | null>(null);
    const [processedHtml, setProcessedHtml] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const apiBase = useMemo(() => import.meta.env.VITE_API_BASE_URL, []);

    useEffect(() => {
        if (DEBUG) console.log("[NoticeDetail] fetch start:", `${apiBase}notice/api/mobile/${id}`);
        fetch(`${apiBase}notice/api/mobile/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (DEBUG) console.log("[NoticeDetail] fetch data:", data);
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
        const links = container.querySelectorAll("a");
        const onClick = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
        };
        links.forEach((link) => {
            link.addEventListener("click", onClick);
            link.setAttribute("style", "color: gray; text-decoration: none; cursor: default;");
        });
        return () => links.forEach((link) => link.removeEventListener("click", onClick));
    }, [processedHtml]);

    if (error) return <div>{error}</div>;
    if (!notice) return <div />;

    const showInline = !(notice.has_attachment && isEmptyHtml(notice.content));

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.backButton} onClick={onClose}>
                    X
                </button>
                <h2>{notice.title}</h2>
                <p className={styles.createdAt}>{notice.createdAt}</p>
                <hr />
                {showInline ? (
                    <div id="notice-content" className={styles.modalNoticeContent} dangerouslySetInnerHTML={{ __html: processedHtml }} />
                ) : (
                    <p className={styles.modalNoticeMessage}>웹에서 확인해주세요 (첨부파일 있음)</p>
                )}
            </div>

            <div className={styles.qrContainer}>
                <p>&nbsp; 모바일에서 확인하려면 QR을 스캔하세요</p>
                <QRCode value={`${window.location.origin}/notice/${notice.id}`} size={128} />
            </div>
        </div>
    );
};

export default NoticeDetail;
