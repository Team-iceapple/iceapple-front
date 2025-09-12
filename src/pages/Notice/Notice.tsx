import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Notice.module.css";
import NoticeModal from "./NoticeDetail";
import NoticePinIcon from "../../../assets/notice-content-pin-icon.svg";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { Icon } from "@iconify/react";
import type { Swiper as SwiperType } from "swiper";

export type NoticeItem = {
    id: string;
    title: string;
    createdAt: string;
    is_pin: boolean;
    content: string;
    has_attachment: boolean;
};

const chunk = <T,>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
    );

const Notice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notices, setNotices] = useState<NoticeItem[]>([]);
    const swiperRef = useRef<SwiperType | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const url = `${import.meta.env.VITE_API_BASE_URL}notice/mobile`;
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => setNotices(data.mobiles))
            .catch(() => {});
    }, []);

    const handleClick = (noticeId: string) => {
        navigate(`/notice/${noticeId}`);
    };

    const closeModal = () => {
        navigate("/notice");
    };

    const selectedNotice = notices.find((n) => n.id === id);
    const pinned = notices.filter((n) => n.is_pin).slice(0, 3);
    const unpinned = notices.filter((n) => !n.is_pin);
    const sorted = [...pinned, ...unpinned];

    const numberedNotices = sorted.map((notice, index) => ({
        ...notice,
        postNumber: sorted.length - index + 631,
    }));

    const numberedChunks = chunk(numberedNotices, 6);
    const totalSlides = numberedChunks.length;

    useEffect(() => {
        setCurrentIndex(0);
        swiperRef.current?.slideTo(0, 0);
    }, [totalSlides]);

    return (
        <div className={styles["notice-container"]}>
            <div className={styles["notice-header"]}>
                <Icon icon="lucide:megaphone" className={styles["notice-header-icon"]} />
                <h1 className={styles["notice-header-title"]}>공지사항</h1>
            </div>

            <div className={styles["notice-swiper-frame"]}>
                {currentIndex > 0 && (
                    <button
                        type="button"
                        aria-label="이전 공지"
                        className={`${styles["navArrow"]} ${styles["navLeft"]}`}
                        onClick={() => swiperRef.current?.slidePrev()}
                    >
                        <Icon icon="lucide:chevron-left" />
                    </button>
                )}

                <Swiper
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    modules={[Pagination]}
                    className={styles["notice-swiper"]}
                    onSwiper={(inst) => (swiperRef.current = inst)}
                    onSlideChange={(sw) => setCurrentIndex(sw.activeIndex)}
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
                                        <div>
                                            <p
                                                className={`${styles["notice-content-title"]} ${notice.is_pin ? styles["pinned-title"] : ""}`}
                                            >
                                                {notice.title.length > 75
                                                    ? `${notice.title.slice(0, 70)}...`
                                                    : notice.title}
                                            </p>
                                        </div>
                                        <div className={styles["notice-content-created-at"]}>
                                            {notice.createdAt}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {currentIndex < totalSlides - 1 && (
                    <button
                        type="button"
                        aria-label="다음 공지"
                        className={`${styles["navArrow"]} ${styles["navRight"]}`}
                        onClick={() => swiperRef.current?.slideNext()}
                    >
                        <Icon icon="lucide:chevron-right" />
                    </button>
                )}
            </div>

            {selectedNotice && (
                <NoticeModal id={selectedNotice.id} onClose={closeModal} />
            )}
        </div>
    );
};

export default Notice;
