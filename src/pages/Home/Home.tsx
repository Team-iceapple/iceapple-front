import { useEffect, useRef, useState } from "react";
import styles from "./Home.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Icon } from "@iconify/react";

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
    const [preferredVolume, setPreferredVolume] = useState<number>(0);

    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const swiperRef = useRef<any>(null);
    const prevIndexRef = useRef(0);

    useEffect(() => {
        let abort = false;
        const listEndpoints = [`${ORIGIN}${BASE_PATH}/home/videos/playlist`];
        (async () => {
            try {
                let urls: string[] = [];
                let lastErr: unknown = null;
                try {
                    const res = await fetch(listEndpoints[0], { headers: { Accept: "application/json" } });
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
                prevIndexRef.current = 0;
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
                } catch {}
            });
        };
    }, []);

    useEffect(() => {
        if (!videoUrls.length) return;

        videoRefs.current.forEach((el, i) => {
            if (!el) return;
            try {
                if (i !== activeIndex) el.pause();
                el.muted = true;
                el.volume = 0;
            } catch {}
        });

        const v = videoRefs.current[activeIndex];
        if (v) {
            try {
                v.currentTime = 0;
            } catch {}
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
                            try {
                                v.currentTime = 0;
                            } catch {}
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
        const nextIdx = swiper.realIndex ?? swiper.activeIndex ?? 0;
        const prevIdx = prevIndexRef.current;

        const prevV = videoRefs.current[prevIdx];
        if (prevV) {
            try {
                prevV.pause();
            } catch {}
            try {
                prevV.currentTime = 0;
            } catch {}
        }

        const nextV = videoRefs.current[nextIdx];
        if (nextV) {
            try {
                nextV.currentTime = 0;
            } catch {}
            try {
                nextV.muted = preferredVolume === 0;
                nextV.volume = preferredVolume;
                nextV.play().catch(() => {});
            } catch {}
        }

        setActiveIndex(nextIdx);
        prevIndexRef.current = nextIdx;
    };

    const toggleVolume = () => {
        const next = preferredVolume === 0 ? 1 : 0;
        setPreferredVolume(next);
        const v = videoRefs.current[activeIndex];
        if (v) {
            v.muted = next === 0;
            v.volume = next;
            if (v.paused) {
                v.play().catch(() => {});
            }
        }
    };

    const volumeIconName = preferredVolume === 0 ? "mdi:volume-off" : "mdi:volume-high";

    return (
        <div className={styles.container}>
            <div className={styles.videoWrapper}>
                {videoUrls.length > 0 ? (
                    <>
                        <Swiper
                            // modules={[Pagination]}
                            onSwiper={(sw) => {
                                swiperRef.current = sw;
                            }}
                            // onBeforeInit={(swiper) => {
                            //     if (typeof swiper.params.pagination !== "boolean" && paginationRef.current) {
                            //         if (swiper.params.pagination) {
                            //             swiper.params.pagination.el = paginationRef.current;
                            //         }
                            //     }
                            // }}
                            // pagination={{ clickable: true }}
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
                                        muted={preferredVolume === 0}
                                        playsInline
                                        autoPlay={idx === activeIndex}
                                        loop={true}
                                        preload="auto"
                                        className={styles.video}
                                        // crossOrigin="anonymous"
                                        onLoadedMetadata={() => {
                                            const v = videoRefs.current[idx];
                                            if (!v) return;
                                            v.muted = preferredVolume === 0;
                                            v.volume = preferredVolume;
                                            try {
                                                v.currentTime = 0;
                                            } catch { /* empty */ }
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

                        <button
                            className={styles.volumeBtn}
                            onClick={toggleVolume}
                            aria-label={preferredVolume === 0 ? "볼륨 켜기" : "볼륨 끄기"}
                            aria-pressed={preferredVolume !== 0}
                            title={preferredVolume === 0 ? "볼륨 켜기" : "볼륨 끄기"}
                        >
                            <Icon icon={volumeIconName} className={styles.emoji} style={{ color: "#fff" }} />
                        </button>

                        {autoplayFailed && (
                            <button
                                className={styles.playOverlay}
                                onClick={() => {
                                    const v = videoRefs.current[activeIndex];
                                    if (v) {
                                        v.muted = preferredVolume === 0;
                                        v.volume = preferredVolume;
                                        try {
                                            v.currentTime = 0;
                                        } catch {}
                                        v.play().catch(() => {});
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
             {/*<div ref={paginationRef} className={styles.pagination} />*/}
        </div>
    );
};

export default Home;
