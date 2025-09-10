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
    fileUrl?: string; // "/media/v_xxx.mp4"
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
    const [rate, setRate] = useState<number>(() => {
        const saved = localStorage.getItem("home.videoRate");
        return saved ? Number(saved) : 1.3;
    });

    // 비디오 엘리먼트 레퍼런스(슬라이드별)
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    // 목록 우선 → 폴백(current)
    useEffect(() => {
        let abort = false;

        const listEndpoints = [
            `${ORIGIN}${BASE_PATH}/home/videos`,        // 목록
            `${ORIGIN}${BASE_PATH}/home/videos/current` // 폴백
        ];

        (async () => {
            try {
                let urls: string[] = [];
                let lastErr: any = null;

                // 1) 목록 시도
                try {
                    const res = await fetch(listEndpoints[0], { headers: { Accept: "application/json" } });
                    if (res.ok) {
                        const data = await res.json();
                        // 응답이 배열 또는 {items:[...]} 형태 어느 쪽이든 처리
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

                // 2) 목록이 비어있으면 current 폴백
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

    // 배속은 모든 비디오에 적용(활성 슬라이드 우선)
    useEffect(() => {
        videoRefs.current.forEach((el) => {
            if (el) el.playbackRate = rate;
        });
    }, [rate, videoUrls]);

    // 활성 슬라이드 자동재생 / 비활성 슬라이드 일시정지
    useEffect(() => {
        if (!videoUrls.length) return;

        // 모두 정지
        videoRefs.current.forEach((el, i) => {
            if (el && i !== activeIndex) {
                try { el.pause(); } catch {}
            }
        });

        // 활성 인덱스 재생 시도
        const v = videoRefs.current[activeIndex];
        if (v) {
            v.muted = true;
            (v as any).playsInline = true;
            v.autoplay = true;
            v.playbackRate = rate;

            (async () => {
                try {
                    await v.play();
                    setAutoplayFailed(false);
                } catch {
                    const onMeta = async () => {
                        v.removeEventListener("loadedmetadata", onMeta);
                        try { await v.play(); setAutoplayFailed(false); } catch { setAutoplayFailed(true); }
                    };
                    v.addEventListener("loadedmetadata", onMeta);
                }
            })();
        }
    }, [activeIndex, videoUrls, rate]);

    const setSpeed = (next: number) => {
        setRate(next);
        localStorage.setItem("home.videoRate", String(next));
        videoRefs.current.forEach((el) => { if (el) el.playbackRate = next; });
    };

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
                                        muted
                                        loop
                                        playsInline
                                        preload="auto"
                                        className={styles.video}
                                        crossOrigin="anonymous"
                                        onLoadedMetadata={() => {
                                            const v = videoRefs.current[idx];
                                            if (v) {
                                                v.playbackRate = rate;
                                                if (idx === activeIndex) v.play().catch(() => setAutoplayFailed(true));
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

                        <div className={styles.controls}>
                            <label className={styles.rateLabel}>속도 {rate.toFixed(2)}x</label>
                            <input
                                type="range"
                                min={0.25}
                                max={2}
                                step={0.05}
                                value={rate}
                                onChange={(e) => setSpeed(Number(e.target.value))}
                                className={styles.rateSlider}
                            />
                            <div className={styles.rateButtons}>
                                {[0.5, 1, 1.25, 1.5, 2].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setSpeed(r)}
                                        className={`${styles.rateBtn} ${Math.abs(rate - r) < 0.001 ? styles.active : ""}`}
                                    >
                                        {r}x
                                    </button>
                                ))}
                            </div>
                        </div>

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
