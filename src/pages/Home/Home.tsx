import { useEffect, useRef, useState } from "react";
import styles from "./Home.module.css";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

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

    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    useEffect(() => {
        let abort = false;

        const listEndpoints = [
            `${ORIGIN}${BASE_PATH}/home/videos`,
            `${ORIGIN}${BASE_PATH}/home/videos/current`
        ];

        (async () => {
            try {
                let urls: string[] = [];
                let lastErr: any = null;

                try {
                    const res = await fetch(listEndpoints[0], { headers: { Accept: "application/json" } });
                    if (res.ok) {
                        const data = await res.json();
                        const arr: VideoItem[] = Array.isArray(data) ? data : (data?.items ?? []);
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

                if (urls.length === 0) {
                    try {
                        const res = await fetch(listEndpoints[1], { headers: { Accept: "application/json" } });
                        if (res.status === 204) {
                            urls = [];
                        } else if (res.ok) {
                            const data: VideoItem = await res.json();
                            const raw = data?.fileUrl || data?.filePath || "";
                            const abs = buildMediaUrl(String(raw));
                            if (abs) urls = [abs];
                        } else {
                            const txt = await res.text().catch(() => "");
                            throw new Error(`[${res.status}] ${txt || res.statusText}`);
                        }
                    } catch (e) {
                        lastErr = e;
                    }
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
        };
    }, []);

    useEffect(() => {
        if (!videoUrls.length) return;

        videoRefs.current.forEach((el, i) => {
            if (el && i !== activeIndex) {
                try {
                    el.pause();
                } catch {}
            }
        });

        const v = videoRefs.current[activeIndex];
        if (v) {
            v.muted = true;

            // 숫자로 소리 설정
            v.volume = 0;

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
    }, [activeIndex, videoUrls]);

    const handleSlideChange = (swiper: any) => {
        setActiveIndex(swiper.realIndex ?? swiper.activeIndex ?? 0);
    };

    return (
        <div className={styles.container}>
            <div className={styles.videoWrapper}>
                {videoUrls.length > 0 ? (
                    <>
                        <Swiper
                            modules={[Pagination]}
                            pagination={{ clickable: true }}
                            loop={videoUrls.length > 1}
                            onSlideChange={handleSlideChange}
                            className={styles.swiper}
                        >
                            {videoUrls.map((src, idx) => (
                                <SwiperSlide key={src + "_" + idx}>
                                    <video
                                        ref={(el) => (videoRefs.current[idx] = el)}
                                        src={src}
                                        autoPlay={idx === activeIndex}
                                        loop
                                        playsInline
                                        preload="auto"
                                        className={styles.video}
                                        crossOrigin="anonymous"
                                        onLoadedMetadata={() => {
                                            const v = videoRefs.current[idx];
                                            if (v && idx === activeIndex) {
                                                v.play().catch(() => setAutoplayFailed(true));
                                            }
                                        }}
                                        onError={() => {
                                            const v = videoRefs.current[idx];
                                            console.error("video 태그 에러:", src, v?.error?.code, v?.error);
                                        }}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {autoplayFailed && (
                            <button
                                className={styles.playOverlay}
                                onClick={() => {
                                    const v = videoRefs.current[activeIndex];
                                    v?.play();
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
        </div>
    );
};

export default Home;
