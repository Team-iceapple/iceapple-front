import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Sojoong.module.css";
import SojoongDetail from "./SojoongDetail.tsx";
import NoticePinIcon from "../../../assets/notice-content-pin-icon.svg";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

import { Icon } from "@iconify/react";

export type NoticeItem = {
    id: string | number;
    title: string;
    createdAt: string;
    is_pin: boolean;
    content: string;
    has_attachment: boolean;
    postNumber?: number;
};

const API_URL = `${import.meta.env.VITE_API_BASE_URL}notice/api/sojoong`;

const chunk = <T,>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
    );

const Sojoong = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notices, setNotices] = useState<NoticeItem[]>([]);

    useEffect(() => {
        console.log("📡 Sojoong 목록 요청 URL:", API_URL);

        fetch(API_URL)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                console.log("📦 Sojoong 응답 데이터:", data);
                const list: NoticeItem[] =
                    Array.isArray(data) ? data :
                        Array.isArray(data?.notices) ? data.notices :
                            Array.isArray(data?.items) ? data.items :
                                [];
                setNotices(data.notices);
                console.log(data.notices);
            })
            .catch((err) => {
                console.error("❌ 공지사항 로딩 실패:", err);
                setNotices([]);
            });
    }, []);

    const handleClick = (noticeId: string | number) => {
        navigate(`/sojoong/${noticeId}`);
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
        postNumber: sorted.length - index + 631,
    }));

    const numberedChunks = chunk(numberedNotices, 6);

    return (
        <div data-scope="sojoong-page" className={styles.sojoongContainer}>
            <div className={styles.sojoongHeader}>
                <Icon icon="lucide:megaphone" className={styles.sojoongHeaderIcon} />
                <h1 className={styles.sojoongHeaderTitle}>공지사항</h1>
            </div>

            <Swiper
                slidesPerView={1}
                pagination={{ clickable: true }}
                modules={[Pagination]}
                className={styles.sojoongSwiper}
            >
                {numberedChunks.map((chunk, index) => (
                    <SwiperSlide key={index}>
                        <div className={styles.sojoongSlideGroup}>
                            {chunk.map((notice) => (
                                <div
                                    key={notice.id}
                                    className={styles.sojoongContent}
                                    onClick={() => handleClick(notice.id)}
                                >
                                    {notice.is_pin ? (
                                        <img
                                            src={NoticePinIcon}
                                            alt="공지 고정 아이콘"
                                            className={styles.sojoongPinIcon}
                                        />
                                    ) : (
                                        <div className={styles.sojoongContentId}>
                                            {notice.postNumber}
                                        </div>
                                    )}
                                    <div>
                                        <p className={styles.sojoongContentTitle}>
                                            {notice.title?.length > 75
                                                ? `${notice.title.slice(0, 70)}...`
                                                : notice.title}
                                        </p>
                                    </div>
                                    <div className={styles.sojoongContentCreatedAt}>
                                        {notice.createdAt}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {selectedNotice && (
                <SojoongDetail id={String(selectedNotice.id)} onClose={closeModal} />
            )}
        </div>
    );

};

export default Sojoong;
