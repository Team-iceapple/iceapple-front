import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Sojoong.module.css";
import SojoongDetail from "./SojoongDetail";
import NoticePinIcon from "../../../assets/notice-content-pin-icon.svg";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { Icon } from "@iconify/react";
import type { Swiper as SwiperType } from "swiper";

export type NoticeItem = {
    id: string | number;
    title: string;
    createdAt: string;
    is_pin: boolean;
    content: string;
    has_attachment: boolean;
    postNumber?: number;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE}notice/sojoong`;

const chunk = <T,>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
    );

const Sojoong = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notices, setNotices] = useState<NoticeItem[]>([]);
    const swiperRef = useRef<SwiperType | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetch(API_URL)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                const list: NoticeItem[] =
                    Array.isArray(data) ? data :
                        Array.isArray(data?.notices) ? data.notices :
                            Array.isArray(data?.items) ? data.items :
                                [];
                setNotices(list);
            })
            .catch(() => {
                setNotices([]);
            });
    }, []);

    const handleClick = (nid: string | number) => {
        navigate(`/sojoong/${nid}`);
    };

    const closeModal = () => {
        navigate("/sojoong");
    };

    const selectedNotice = notices.find((n) => String(n.id) === String(id));
    const pinned = notices.filter((n) => n.is_pin).slice(0, 3);
    const unpinned = notices.filter((n) => !n.is_pin);
    const sorted = [...pinned, ...unpinned];

    const numberedNotices = sorted.map((notice, index) => ({
        ...notice,
        postNumber: sorted.length - index,
    }));

    const numberedChunks = chunk(numberedNotices, 6);
    const totalSlides = numberedChunks.length;

    useEffect(() => {
        setCurrentIndex(0);
        swiperRef.current?.slideTo(0, 0);
    }, [totalSlides]);

    return (
        <div data-scope="sojoong-page" className={styles["sojoong-container"]}>
            <div className={styles["sojoong-header"]}>
                <Icon icon="lucide:megaphone" className={styles["sojoong-header-icon"]} />
                <h1 className={styles["sojoong-header-title"]}>공지사항</h1>
            </div>

            <div className={styles["sojoong-swiper-frame"]}>
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
                    className={styles["sojoong-swiper"]}
                    onSwiper={(inst) => (swiperRef.current = inst)}
                    onSlideChange={(sw) => setCurrentIndex(sw.activeIndex)}
                >
                    {numberedChunks.map((group, index) => (
                        <SwiperSlide key={index}>
                            <div className={styles["sojoong-slide-group"]}>
                                {group.map((notice) => (
                                    <div
                                        key={notice.id}
                                        className={styles["sojoong-content"]}
                                        onClick={() => handleClick(notice.id)}
                                    >
                                        {notice.is_pin ? (
                                            <img
                                                src={NoticePinIcon}
                                                alt="공지 고정 아이콘"
                                                className={styles["sojoong-pin-icon"]}
                                            />
                                        ) : (
                                            <div className={styles["sojoong-content-id"]}>
                                                {notice.postNumber}
                                            </div>
                                        )}
                                        <div>
                                            <p
                                                className={`${styles["sojoong-content-title"]} ${
                                                    notice.is_pin ? styles["pinned-title"] : ""
                                                }`}
                                            >
                                                {notice.title?.length > 75
                                                    ? `${notice.title.slice(0, 70)}...`
                                                    : notice.title}
                                            </p>
                                        </div>
                                        <div className={styles["sojoong-content-created-at"]}>
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
                <SojoongDetail id={String(selectedNotice.id)} onClose={closeModal} />
            )}
        </div>
    );
};

export default Sojoong;
