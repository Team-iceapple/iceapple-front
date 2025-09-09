import { useEffect, useRef, useState } from "react";
import styles from "./Home.module.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = new URL(API_BASE);
const ORIGIN = API.origin;
const BASE_PATH = API.pathname.replace(/\/$/, "");

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
    const [videoUrl, setVideoUrl] = useState("");
    const [autoplayFailed, setAutoplayFailed] = useState(false);
    const [rate, setRate] = useState<number>(() => {
        const saved = localStorage.getItem("home.videoRate");
        return saved ? Number(saved) : 1.3;
    });
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        let abort = false;

        const endpoints = [`${ORIGIN}${BASE_PATH}/home/videos/current`];

        (async () => {
            try {
                let data: any = null;
                let lastErr: any = null;

                for (const url of endpoints) {
                    try {
                        const res = await fetch(url, { headers: { Accept: "application/json" } });
                        if (res.status === 204) {
                            data = null;
                            break;
                        }
                        if (!res.ok) {
                            const txt = await res.text().catch(() => "");
                            throw new Error(`[${res.status}] ${txt || res.statusText}`);
                        }
                        data = await res.json();
                        break;
                    } catch (e) {
                        lastErr = e;
                        continue;
                    }
                }

                if (abort) return;

                if (!data) {
                    if (lastErr) console.error("비디오 로드 실패(모든 후보 실패):", lastErr);
                    setVideoUrl("");
                    return;
                }

                const raw = data?.fileUrl || data?.filePath || "";
                const abs = buildMediaUrl(String(raw));
                setVideoUrl(abs);
            } catch (err) {
                if (!abort) {
                    console.error("비디오 로드 실패(예외):", err);
                    setVideoUrl("");
                }
            }
        })();

        return () => {
            abort = true;
        };
    }, []);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        v.playbackRate = rate;
    }, [rate, videoUrl]);

    useEffect(() => {
        const v = videoRef.current;
        if (!v || !videoUrl) return;
        v.muted = true;
        (v as any).playsInline = true;
        v.autoplay = true;

        const tryPlay = async () => {
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
        };
        tryPlay();
    }, [videoUrl]);

    const setSpeed = (next: number) => {
        setRate(next);
        localStorage.setItem("home.videoRate", String(next));
        if (videoRef.current) videoRef.current.playbackRate = next;
    };

    return (
        <div className={styles.container}>
            <div className={styles.videoWrapper}>
                {videoUrl ? (
                    <>
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            className={styles.video}
                            crossOrigin="anonymous"
                            onLoadedMetadata={() =>
                                videoRef.current?.play().catch(() => setAutoplayFailed(true))
                            }
                            onError={() => {
                                const v = videoRef.current;
                                console.error("video 태그 에러:", videoUrl, v?.error?.code, v?.error);
                            }}
                        />

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
                            <button className={styles.playOverlay} onClick={() => videoRef.current?.play()}>
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
