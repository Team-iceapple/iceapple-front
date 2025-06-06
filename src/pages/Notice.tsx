import styles from "./Notice.module.css";
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
    pin: boolean;
};

const notices: NoticeItem[] = [
    {
        id: "605",
        title: "2025년 법정의무 폭력예방교육 '이클래스한밭' 이수 안내",
        createdAt: "2025-04-28",
        pin: true,
    },
    {
        id: "603",
        title: "중간고사 성적 공개 일정 안내",
        createdAt: "2025-04-20",
        pin: false,
    },
    {
        id: "602",
        title: "전공 수업 평가 참여 요청",
        createdAt: "2025-04-15",
        pin: false,
    },
    {
        id: "601",
        title: "캡스톤디자인 발표 일정 공지",
        createdAt: "2025-04-12",
        pin: false,
    },
    {
        id: "600",
        title: "학과 행사 안내: 봄 소풍",
        createdAt: "2025-04-10",
        pin: false,
    },
    {
        id: "599",
        title: "졸업논문 제출 마감일 안내",
        createdAt: "2025-04-05",
        pin: false,
    },
    {
        id: "598",
        title: "개인형 이동장치 신고",
        createdAt: "2025-04-05",
        pin: false,
    },
];

const chunk = <T,>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
    );

const Notice = () => {
    const noticeChunks = chunk(notices, 6); // 6개씩 묶기

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
                pagination={{
                    clickable: true,
                }}
                modules={[Pagination]}
                className={styles["notice-swiper"]}
            >
            {noticeChunks.map((chunk, index) => (
                    <SwiperSlide key={index}>
                        <div className={styles["notice-slide-group"]}>
                            {chunk.map((notice) => (
                                <div
                                    key={`${notice.id}-${notice.title}`}
                                    className={styles["notice-content"]}
                                >
                                    {notice.pin ? (
                                        <img
                                            src={NoticePinIcon}
                                            alt="공지 고정 아이콘"
                                            className={styles["notice-pin-icon"]}
                                        />
                                    ) : (
                                        <div className={styles["notice-content-id"]}>
                                            {notice.id}
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
        </>
    );
};

export default Notice;
