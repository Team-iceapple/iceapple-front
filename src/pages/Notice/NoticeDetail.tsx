import { useEffect, useState } from "react";
import styles from "./NoticeDetail.module.css";

import QRCode from "react-qr-code";

type Props = {
    id: string;
    onClose: () => void;
};

type NoticeDetailDto = {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    has_attachment: false;
};

const NoticeDetail = ({ id, onClose }: Props) => {
    const [notice, setNotice] = useState<NoticeDetailDto | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}notice/api/mobile/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                return res.json();
            })
            .then((data) => {
                setNotice(data);
                setError(null);
            })
            .catch((err) => {
                console.error("❌ 공지 상세 불러오기 실패:", err);
                setError("상세 내용을 불러오는 데 실패했습니다.");
            });
    }, [id]);

    useEffect(() => {
        const container = document.getElementById("notice-content");
        if (container) {
            const links = container.querySelectorAll("a");
            links.forEach((link) => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
                link.setAttribute("style", "color: gray; text-decoration: none; cursor: default;");
            });
        }
    }, [notice]);

    const isEmptyHtml = (html: string | null | undefined): boolean => {
        if (!html) return true;
        const stripped = html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, '')
            .replace(/\s/g, '');
        return stripped === '';
    };


    if (error) return <div>{error}</div>;
    if (!notice) return <div></div>;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.backButton} onClick={onClose}>X</button>
                <h2>{notice.title}</h2>
                <p className={styles.createdAt}>{notice.createdAt}</p>
                <hr />

                {notice.has_attachment && isEmptyHtml(notice.content) ? (
                    <p className={styles["modal-notice-message"]}>
                        웹에서 확인해주세요 (첨부파일 있음)
                    </p>
                ) : (
                    <div
                        id="notice-content"
                        className={styles["modal-notice-content"]}
                        dangerouslySetInnerHTML={{ __html: notice.content }}
                    />
                )}
            </div>
            <div className={styles["qr-container"]}>
                <p> &nbsp; 모바일에서 확인하려면 QR을 스캔하세요</p>
                <QRCode value={`${window.location.origin}/notice/${notice.id}`} size={128} />
            </div>
        </div>
    );
};

export default NoticeDetail;
