import { useEffect, useState } from "react";
import styles from "./NoticeModal.module.css";

type Props = {
    id: string;
    onClose: () => void;
};

type NoticeDetailDto = {
    id: string;
    title: string;
    content: string; // HTML 포함 문자열
    createdAt: string;
};

const NoticeModal = ({ id, onClose }: Props) => {
    const [notice, setNotice] = useState<NoticeDetailDto | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`http://localhost:3000/api/notice/${id}`)
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

    if (error) return <div>{error}</div>;
    if (!notice) return <div></div>;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.backButton} onClick={onClose}>X</button>
                <h2>{notice.title}</h2>
                <p className={styles.createdAt}>{notice.createdAt}</p>
                <hr />
                <div
                    id="notice-content"
                    className={styles.content}
                    dangerouslySetInnerHTML={{ __html: notice.content }}
                />
            </div>
        </div>
    );
};

export default NoticeModal;
