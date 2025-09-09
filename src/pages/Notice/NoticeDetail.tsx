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
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ")
            .replace(/[\u200B-\u200D\uFEFF]/g, "")
            .trim();

    const textOf = (el: Element) => norm(el.textContent || "");

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

    const pEls = Array.from(root.querySelectorAll("p"));
    const tokensAll = pEls.map(textOf).filter((t) => t !== "");

    type TokType = "NUM" | "CODE" | "TIME" | "QUANT" | "TEXT" | "SUM";
    const timeRe = /^\[?\d{1,2}:\d{2}\s*[~∼-]\s*\d{1,2}:\d{2}\]?$/;
    const quantRe = /^\d{1,3}(?:,\d{3})*(?:명|개|원|회|주|일|학점)?$/;
    const isNum = (t: string) => /^\d+$/.test(t);
    const isCode = (t: string) => /^[A-Z0-9\-]+$/.test(t) && /[A-Z]/.test(t) && /\d/.test(t);
    const isTime = (t: string) => timeRe.test(t);
    const isQuant = (t: string) => quantRe.test(t);
    const typeOf = (t: string): TokType =>
        t === "합계" ? "SUM" : isTime(t) ? "TIME" : isQuant(t) ? "QUANT" : isNum(t) ? "NUM" : isCode(t) ? "CODE" : "TEXT";

    function scoreK(start: number, k: number) {
        let i = start;
        let rows = 0;
        let consistency = 0;
        const colTypes: Record<number, Record<TokType, number>> = {};
        while (i < tokensAll.length) {
            if (tokensAll[i] === "합계") {
                if (tokensAll[i + 1] && /^(?:\d+|[\d,]+)$/.test(tokensAll[i + 1])) i += 2;
                else i += 1;
                rows++;
                break;
            }
            const slice = tokensAll.slice(i, i + k);
            if (slice.length < k) break;
            if (slice.every((t) => t === "")) break;
            slice.forEach((t, ci) => {
                const ty = typeOf(t);
                (colTypes[ci] ??= { NUM: 0, CODE: 0, TIME: 0, QUANT: 0, TEXT: 0, SUM: 0 } as any)[ty]++;
            });
            rows++;
            i += k;
            if (rows >= 2 && i < tokensAll.length) {
                const nxt = tokensAll.slice(i, i + k);
                const txtRatio = nxt.filter((t) => typeOf(t) === "TEXT").length / Math.max(nxt.length, 1);
                if (txtRatio > 0.85) break;
            }
        }
        for (const ci in colTypes) {
            const counts = colTypes[ci] as Record<TokType, number>;
            const max = Math.max(counts.NUM, counts.CODE, counts.TIME, counts.QUANT, counts.TEXT, counts.SUM);
            const total = counts.NUM + counts.CODE + counts.TIME + counts.QUANT + counts.TEXT + counts.SUM;
            if (total) consistency += max / total;
        }
        return rows * 2 + consistency;
    }

    function validateTable(start: number, k: number, end: number) {
        if (k < 3 || end - start < k * 2) return false;
        const header = tokensAll.slice(Math.max(0, start - k), start).slice(-k);
        if (header.length !== k) return false;
        const headerTypes = header.map(typeOf);
        const headerTextRatio = headerTypes.filter((t) => t === "TEXT").length / k;
        const headerAvgLen = header.reduce((a, b) => a + b.length, 0) / k;
        if (!(headerTextRatio >= 0.6 && headerAvgLen <= 12)) return false;
        const lookahead = tokensAll.slice(start, Math.min(end, start + k * 3));
        const hasTimeOrQuant = lookahead.some((t) => isTime(t) || isQuant(t));
        let i = start;
        let dataRows = 0;
        let signalCells = 0;
        let allCells = 0;
        while (i < end) {
            if (tokensAll[i] === "합계") {
                i += isNum(tokensAll[i + 1] || "") ? 2 : 1;
                continue;
            }
            const row = tokensAll.slice(i, i + k);
            if (row.length < k) break;
            const types = row.map(typeOf);
            const sig = types.filter((t) => t === "NUM" || t === "CODE" || t === "TIME" || t === "QUANT").length;
            signalCells += sig;
            allCells += k;
            dataRows++;
            i += k;
        }
        if (dataRows < 2) return false;
        const density = signalCells / Math.max(allCells, 1);
        if (!(density >= 0.15 || hasTimeOrQuant)) return false;
        return true;
    }

    const tables: Array<{ start: number; k: number; end: number }> = [];
    let cursor = 0;
    while (cursor < tokensAll.length) {
        let best = { k: 0, score: 0, start: -1, end: -1 };
        for (let k = 2; k <= 14; k++) {
            const s = scoreK(cursor, k);
            if (s > best.score) best = { k, score: s, start: cursor, end: -1 };
        }
        if (best.k === 0 || best.score < 5) {
            cursor++;
            continue;
        }
        let i = best.start;
        while (i < tokensAll.length) {
            if (tokensAll[i] === "합계") {
                i += isNum(tokensAll[i + 1] || "") ? 2 : 1;
                break;
            }
            const row = tokensAll.slice(i, i + best.k);
            if (row.length < best.k) break;
            i += best.k;
            const nxt = tokensAll.slice(i, i + best.k);
            const txtRatio = nxt.filter((t) => typeOf(t) === "TEXT").length / Math.max(nxt.length, 1);
            if (txtRatio > 0.9) break;
        }
        best.end = i;
        if (validateTable(best.start, best.k, best.end)) {
            tables.push({ start: best.start, k: best.k, end: best.end });
            cursor = best.end + 1;
        } else {
            cursor = best.start + 1;
        }
    }

    if (!tables.length) {
        finalize(root, doc);
        return root.innerHTML;
    }

    for (const tbl of tables) {
        const headerTokens = tokensAll.slice(Math.max(0, tbl.start - tbl.k), tbl.start);
        const header = headerTokens.slice(-tbl.k);

        const rows: string[][] = [];
        let i = tbl.start;
        while (i < tbl.end) {
            if (tokensAll[i] === "합계") {
                const sumVal = isNum(tokensAll[i + 1] || "") ? tokensAll[i + 1] : "";
                const tr: string[] = Array(tbl.k).fill("");
                tr[0] = sumVal ? `합계 ${sumVal}` : "합계";
                rows.push(tr);
                i += sumVal ? 2 : 1;
                continue;
            }
            const base = tokensAll.slice(i, i + tbl.k);
            if (base.length < tbl.k) break;

            if (tbl.k === 4) {
                const first = base[0] ?? "";
                const second = base[1] ?? "";
                const rest = tokensAll.slice(i + 2, Math.min(tbl.end, i + 2 + 12));
                let j = 0;
                let produced = 0;
                while (j < rest.length) {
                    const t1 = rest[j];
                    const t2 = rest[j + 1];
                    if (!t1) break;
                    const isPair =
                        (isTime(t1) || typeOf(t1) !== "TEXT") &&
                        (t2 ? (isQuant(t2) || typeOf(t2) !== "TEXT" || isTime(t2)) : true);
                    if (!isPair) break;
                    const r: string[] = [first, second, t1, t2 || ""];
                    rows.push(r);
                    j += 2;
                    produced++;
                }
                if (produced > 0) {
                    i += 2 + j;
                    continue;
                }
            }

            while (base.length < tbl.k) base.push("");
            rows.push(base);
            i += tbl.k;
        }

        const wrap = doc.createElement("div");
        wrap.className = styles.tableWrap;
        const table = doc.createElement("table");
        table.classList.add(styles.table);

        const thead = doc.createElement("thead");
        const trh = doc.createElement("tr");
        header.forEach((h) => {
            const th = doc.createElement("th");
            th.textContent = h;
            trh.appendChild(th);
        });
        thead.appendChild(trh);
        table.appendChild(thead);

        const tbody = doc.createElement("tbody");
        rows.forEach((r) => {
            const tr = doc.createElement("tr");
            if (r[0].startsWith("합계")) {
                const td = doc.createElement("td");
                td.colSpan = tbl.k;
                td.textContent = r[0];
                tr.appendChild(td);
            } else {
                r.forEach((cell) => {
                    const td = doc.createElement("td");
                    td.textContent = cell;
                    tr.appendChild(td);
                });
            }
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wrap.appendChild(table);

        let anchor: Element | null = null;
        for (let pi = 0; pi < pEls.length; pi++) {
            if (textOf(pEls[pi]) === tokensAll[tbl.start]) {
                anchor = pEls[pi];
                break;
            }
        }
        if (anchor) {
            anchor.replaceWith(wrap);
            let cnt = 1;
            while (cnt < tbl.end - tbl.start) {
                const next = anchor?.nextElementSibling as Element | null;
                if (!next || next.tagName.toLowerCase() !== "p") break;
                next.remove();
                cnt++;
            }
        } else {
            root.appendChild(wrap);
        }
    }

    finalize(root, doc);
    return root.innerHTML;

    function finalize(rootEl: HTMLElement, d: Document) {
        const kogl = d.createElement("div");
        kogl.className = styles.koglBadge;
        const iconImg = d.createElement("img");
        iconImg.src = KOGL_ICON;
        iconImg.alt = "공공누리 제4유형";
        iconImg.className = styles.koglIcon;
        (iconImg as any).onerror = () => ((iconImg as any).style = "display:none;");
        const text = d.createElement("span");
        text.className = styles.koglText;
        text.textContent = KOGL_TEXT;
        kogl.appendChild(iconImg);
        kogl.appendChild(text);
        rootEl.appendChild(kogl);

        const looseCells = Array.from(rootEl.querySelectorAll("th, td")).filter((c) => !c.closest("table"));
        if (looseCells.length) {
            const parents = Array.from(new Set(looseCells.map((c) => c.parentElement).filter(Boolean))) as HTMLElement[];
            parents.forEach((parent) => {
                const cells = Array.from(parent.querySelectorAll(":scope > th, :scope > td"));
                if (!cells.length) return;
                const tableWrap = d.createElement("div");
                tableWrap.className = styles.tableWrap;
                const table = d.createElement("table");
                table.classList.add(styles.table);
                const tbody = d.createElement("tbody");
                const tr = d.createElement("tr");
                cells.forEach((c) => tr.appendChild(c));
                tbody.appendChild(tr);
                table.appendChild(tbody);
                tableWrap.appendChild(table);
                parent.replaceWith(tableWrap);
            });
        }
    }
}

const NoticeDetail = ({ id, onClose }: Props) => {
    const [notice, setNotice] = useState<NoticeDetailDto | null>(null);
    const [processedHtml, setProcessedHtml] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const apiBase = useMemo(() => import.meta.env.VITE_API_BASE_URL, []);

    useEffect(() => {
        if (DEBUG) console.log("[NoticeDetail] fetch start:", `${apiBase}notice/mobile/${id}`);
        fetch(`${apiBase}notice/mobile/${id}`)
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
