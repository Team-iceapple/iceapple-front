import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Notice.module.css";
import NoticeModal from "./NoticeModal";
import ContentIcon from "../../assets/notice-content-icon.png";
import NoticePinIcon from "../../assets/notice-content-pin-icon.png";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

type NoticeItem = {
    id: string;
    title: string;
    createdAt: string;
    is_pin: boolean;
};

const chunk = <T,>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
    );

const Notice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notices, setNotices] = useState<NoticeItem[]>([]);

    useEffect(() => {
        fetch("http://localhost:3000/api/notice")
            .then((res) => res.json())
            .then((data) => setNotices(data.notices))
            .catch((err) => {
                console.error("공지사항 로딩 실패:", err);
            });
    }, []);

    const handleClick = (noticeId: string) => {
        navigate(`/notice/${noticeId}`);
    };

    const closeModal = () => {
        navigate("/notice");
    };

    const selectedNotice = notices.find((n) => n.id === id);
    const noticeChunks = chunk(notices, 6);

    const numberedNotices = notices.map((notice, index) => ({
        ...notice,
        postNumber: notices.length - index,
    }));
    const numberedChunks = chunk(numberedNotices, 6);

    return (
        <>
            <div className={styles["notice-header"]}>
                <div className={styles["notice-header-icon"]}>
                    <img src={ContentIcon} alt="공지 아이콘" />
                </div>
                <div className={styles["notice-header-title"]}>
                    <b>공지사항</b>
                </div>
            </div>

            <Swiper
                slidesPerView={1}
                pagination={{ clickable: true }}
                modules={[Pagination]}
                className={styles["notice-swiper"]}
            >
                {numberedChunks.map((chunk, index) => (
                    <SwiperSlide key={index}>
                        <div className={styles["notice-slide-group"]}>
                            {chunk.map((notice) => (
                                <div
                                    key={notice.id}
                                    className={styles["notice-content"]}
                                    onClick={() => handleClick(notice.id)}
                                >
                                    {notice.is_pin ? (
                                        <img
                                            src={NoticePinIcon}
                                            alt="공지 고정 아이콘"
                                            className={styles["notice-pin-icon"]}
                                        />
                                    ) : (
                                        <div className={styles["notice-content-id"]}>
                                            {notice.postNumber}
                                        </div>
                                    )}
                                    <p className={styles["notice-content-title"]}>
                                        {notice.title}
                                    </p>
                                    <div className={styles["notice-content-created-at"]}>
                                        {notice.createdAt}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {selectedNotice && (
                <NoticeModal id={selectedNotice.id} onClose={closeModal} />
            )}
        </>
    );
};

export default Notice;
