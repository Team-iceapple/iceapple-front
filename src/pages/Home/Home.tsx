import {useEffect, useRef, useState} from "react";
import styles from "./Home.module.css";
import {Swiper, SwiperSlide} from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import {Pagination} from "swiper/modules";
// ⭐ Iconify 라이브러리 임포트
import { Icon } from '@iconify/react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = new URL(API_BASE);
const ORIGIN = API.origin;
const BASE_PATH = API.pathname.replace(/\/$/, "");

type VideoItem = {
    id?: string;
    title?: string;
    current?: boolean;
    filePath?: string;
    fileUrl?: string;
};

function buildMediaUrl(fileUrl: string) {
    if (!fileUrl) return "";
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
    const cleaned = fileUrl.replace(/^\.?\//, "");
    if (cleaned.startsWith("home/")) {
        return `${ORIGIN}${BASE_PATH}/${cleaned}`.replace(/([^:]\/)\/+/g, "$1");
    }
    if (cleaned.startsWith("media/")) {
        return `${ORIGIN}${BASE_PATH}/home/${cleaned}`.replace(/([^:]\/)\/+/g, "$1");
    }
    if (/^v_[\w-]+\.mp4$/i.test(cleaned)) {
        return `${ORIGIN}${BASE_PATH}/home/media/${cleaned}`.replace(/([^:]\/)\/+/g, "$1");
    }
    if (fileUrl.startsWith("/")) {
        return `${ORIGIN}${BASE_PATH}${fileUrl}`.replace(/([^:]\/)\/+/g, "$1");
    }
    return `${ORIGIN}${BASE_PATH}/${cleaned}`.replace(/([^:]\/)\/+/g, "$1");
}

const Home = () => {
    const [videoUrls, setVideoUrls] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [autoplayFailed, setAutoplayFailed] = useState(false);
    // 🔊/🔇 두 상태: 0(뮤트) 또는 1(최대 볼륨)
    const [preferredVolume, setPreferredVolume] = useState<number>(0);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const paginationRef = useRef<HTMLDivElement | null>(null);
    const swiperRef = useRef<any>(null);

    useEffect(() => {
        let abort = false;
        const listEndpoints = [`${ORIGIN}${BASE_PATH}/home/videos/playlist`];
        (async () => {
            try {
                let urls: string[] = [];
                let lastErr: unknown = null;
                try {
                    const res = await fetch(listEndpoints[0], {headers: {Accept: "application/json"}});
                    if (res.ok) {
                        const data = await res.json();
                        const arr: VideoItem[] = Array.isArray(data) ? data : data?.items ?? [];
                        urls = (arr || [])
                            .map((it) => buildMediaUrl(String(it?.fileUrl || it?.filePath || "")))
                            .filter(Boolean);
                    } else if (res.status !== 404) {
                        const txt = await res.text().catch(() => "");
                        throw new Error(`[${res.status}] ${txt || res.statusText}`);
                    }
                } catch (e) {
                    lastErr = e;
                }
                if (abort) return;
                if (urls.length === 0) {
                    if (lastErr) console.error("비디오 로드 실패:", lastErr);
                    setVideoUrls([]);
                    return;
                }
                setVideoUrls(urls);
                setActiveIndex(0);
            } catch (err) {
                if (!abort) {
                    console.error("비디오 로드 실패(예외):", err);
                    setVideoUrls([]);
                }
            }
        })();
        return () => {
            abort = true;
            videoRefs.current.forEach((v) => {
                try {
                    v?.pause();
                } catch {
                }
            });
        };
    }, []);

    // 활성 슬라이드/볼륨 상태 변경 시 적용
    useEffect(() => {
        if (!videoUrls.length) return;
        // 비활성 비디오는 정지 + 음소거 초기화
        videoRefs.current.forEach((el, i) => {
            if (!el) return;
            try {
                if (i !== activeIndex) el.pause();
                el.muted = true;
                el.volume = 0;
            } catch {
            }
        });
        const v = videoRefs.current[activeIndex];
        if (v) {
            v.muted = preferredVolume === 0;
            v.volume = preferredVolume;
            (v as any).playsInline = true;
            v.autoplay = true;
            (async () => {
                try {
                    await v.play();
                    setAutoplayFailed(false);
                } catch {
                    const onMeta = async () => {
                        v.removeEventListener("loadedmetadata", onMeta);
                        try {
                            v.muted = preferredVolume === 0;
                            v.volume = preferredVolume;
                            await v.play();
                            setAutoplayFailed(false);
                        } catch {
                            setAutoplayFailed(true);
                        }
                    };
                    v.addEventListener("loadedmetadata", onMeta);
                }
            })();
        }
    }, [activeIndex, videoUrls, preferredVolume]);

    const handleSlideChange = (swiper: any) => {
        setActiveIndex(swiper.realIndex ?? swiper.activeIndex ?? 0);
    };

    // 🔘 0 ↔ 1 토글
    const toggleVolume = () => {
        const next = preferredVolume === 0 ? 1 : 0;
        setPreferredVolume(next);
        const v = videoRefs.current[activeIndex];
        if (v) {
            v.muted = next === 0;
            v.volume = next;
            if (v.paused) {
                v.play().catch(() => {
                });
            }
        }
    };

    const volumeIconName = preferredVolume === 0 ? 'mdi:volume-off' : 'mdi:volume-high';

    return (
        <div className={styles.container}>
            <div className={styles.videoWrapper}>
                {videoUrls.length > 0 ? (
                    <>
                        <Swiper
                            modules={[Pagination]}
                            onSwiper={(sw) => {
                                swiperRef.current = sw;
                            }}
                            onBeforeInit={(swiper) => {
                                if (typeof swiper.params.pagination !== "boolean" && paginationRef.current) {
                                    swiper.params.pagination.el = paginationRef.current;
                                }
                            }}
                            pagination={{clickable: true}}
                            loop={videoUrls.length > 1}
                            onSlideChange={handleSlideChange}
                            className={styles.swiper}
                        >
                            {videoUrls.map((src, idx) => (
                                <SwiperSlide key={`${src}_${idx}`}>
                                    <video
                                        ref={(el) => {
                                            videoRefs.current[idx] = el;
                                        }}
                                        src={src}
                                        // 🔸 autoplay 정책 통과를 위해 초기엔 muted=true 가 안전하지만
                                        // 상태에 맞춰 속성으로도 반영 (복제 슬라이드 포함)
                                        muted={preferredVolume === 0}
                                        playsInline
                                        autoPlay={idx === activeIndex}
                                        loop={false}
                                        preload="auto"
                                        className={styles.video}
                                        crossOrigin="anonymous"
                                        onLoadedMetadata={() => {
                                            const v = videoRefs.current[idx];
                                            if (!v) return;
                                            v.muted = preferredVolume === 0;
                                            v.volume = preferredVolume;
                                            if (idx === activeIndex) {
                                                v.play().catch(() => setAutoplayFailed(true));
                                            }
                                        }}
                                        onEnded={() => {
                                            swiperRef.current?.slideNext();
                                        }}
                                        onError={() => {
                                            const v = videoRefs.current[idx];
                                            console.error("video 태그 에러:", src, v?.error?.code, v?.error);
                                            swiperRef.current?.slideNext();
                                        }}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        {/* 🔘 볼륨 토글 버튼: 🔇 / 🔊 */}
                        <button
                            className={styles.volumeBtn}
                            onClick={toggleVolume}
                            aria-label={preferredVolume === 0 ? "볼륨 켜기" : "볼륨 끄기"}
                            aria-pressed={preferredVolume !== 0}
                            title={preferredVolume === 0 ? "볼륨 켜기" : "볼륨 끄기"}
                        >
                            {/* ⭐ Icon 컴포넌트로 교체 */}
                            <Icon
                                icon={volumeIconName}
                                className={styles.emoji}
                                style={{ color: '#fff' }} // Iconify는 기본적으로 currentColor를 사용하지만, 명시적으로 흰색 지정
                            />
                        </button>
                        {autoplayFailed && (
                            <button
                                className={styles.playOverlay}
                                onClick={() => {
                                    const v = videoRefs.current[activeIndex];
                                    if (v) {
                                        v.muted = preferredVolume === 0;
                                        v.volume = preferredVolume;
                                        v.play().catch(() => {
                                        });
                                    }
                                }}
                            >
                                재생하기
                            </button>
                        )}
                    </>
                ) : (
                    <p>비디오를 불러오는 중...</p>
                )}
            </div>
            {/* 바깥 컨테이너 페이지네이션 */}
            <div ref={paginationRef} className={styles.pagination}/>
        </div>
    );
};
export default Home;