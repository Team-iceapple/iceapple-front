import { useEffect, useRef } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";

type PdfViewerProps = {
	url: string;
};

GlobalWorkerOptions.workerSrc = workerSrc as unknown as string;

export default function PdfViewer({ url }: PdfViewerProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const cleanupRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		let cancelled = false;
		const container = containerRef.current;
		if (!container || !url) return;

		container.innerHTML = "";
		cleanupRef.current?.();
		cleanupRef.current = null;

		let pdfDoc: PDFDocumentProxy | null = null;
		let resizeObserver: ResizeObserver | null = null;

		const render = async () => {
			try {
				pdfDoc = await getDocument({ url }).promise;
				if (cancelled) return;

				const pageCanvases: HTMLCanvasElement[] = [];

				const renderAllPages = async () => {
					if (!container || !pdfDoc) return;
					container.innerHTML = "";
					pageCanvases.length = 0;

					const containerWidth = container.clientWidth || 800;

					for (let i = 1; i <= pdfDoc.numPages; i++) {
						const pageWrapper = document.createElement("div");
						pageWrapper.style.width = "100%";
						pageWrapper.style.display = "block";
						pageWrapper.style.margin = "0 auto 12px";
						pageWrapper.style.position = "relative";

						const canvas = document.createElement("canvas");
						canvas.style.width = "100%";
						canvas.style.height = "auto";
						canvas.style.display = "block";
						pageWrapper.appendChild(canvas);
						container.appendChild(pageWrapper);
						pageCanvases.push(canvas);

						const page = await pdfDoc.getPage(i);
						const initialViewport = page.getViewport({ scale: 1 });
						const scale = containerWidth / initialViewport.width;
						const viewport = page.getViewport({ scale });

						const ctx = canvas.getContext("2d");
						if (!ctx) continue;
						canvas.width = Math.floor(viewport.width);
						canvas.height = Math.floor(viewport.height);

						await page.render({
							canvasContext: ctx,
							viewport
						}).promise;
					}
				};

				await renderAllPages();

				if ("ResizeObserver" in window) {
					resizeObserver = new ResizeObserver(() => {
						queueMicrotask(() => renderAllPages());
					});
					resizeObserver.observe(container);
				}

				cleanupRef.current = () => {
					resizeObserver?.disconnect();
					resizeObserver = null;
					pdfDoc?.destroy();
					pdfDoc = null;
					if (container) container.innerHTML = "";
				};
			} catch (e) {
				if (container) container.innerHTML = "";
				console.error("PDF 렌더링 실패:", e);
			}
		};

		render();

		return () => {
			cancelled = true;
			cleanupRef.current?.();
			cleanupRef.current = null;
		};
	}, [url]);

	return (
		<div
			ref={containerRef}
			style={{
				width: "100%",
				height: "100%",
				overflow: "auto",
				WebkitOverflowScrolling: "touch",
				background: "#fff",
				borderRadius: "12px",
			}}
		/>
	);
}


