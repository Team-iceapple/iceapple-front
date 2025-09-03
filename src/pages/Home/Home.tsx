import { useEffect, useRef, useState } from "react";
import styles from "./Home.module.css";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}home/videos`;

const Home = () => {
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [autoplayFailed, setAutoplayFailed] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        let abort = false;
        fetch(`${API_BASE_URL}/current`)
            .then((res) => res.json())
            .then((data) => {
                if (abort) return;
                // data.url은 절대/상대경로 모두 가능하다고 가정
                setVideoUrl(data?.url ?? "");
            })
            .catch((err) => {
                console.error("비디오 로드 실패:", err);
            });
        return () => {
            abort = true;
        };
    }, []);

    useEffect(() => {
        const v = videoRef.current;
        if (!v || !videoUrl) return;

        v.muted = true;
        v.setAttribute("playsinline", "true"); // iOS 사파리
        v.playsInline = true;
        v.autoplay = true;

        const tryPlay = async () => {
            try {
                const p = v.play();
                if (p && typeof p.then === "function") {
                    await p;
                }
                setAutoplayFailed(false);
            } catch (_e) {
                const onMeta = async () => {
                    v.removeEventListener("loadedmetadata", onMeta);
                    try {
                        await v.play();
                        setAutoplayFailed(false);
                    } catch (e2) {
                        console.warn("자동재생 실패(사용자 제스처 필요):", e2);
                        setAutoplayFailed(true);
                    }
                };
                v.addEventListener("loadedmetadata", onMeta);
            }
        };

        tryPlay();
    }, [videoUrl]);

    const handleManualPlay = async () => {
        const v = videoRef.current;
        if (!v) return;
        try {
            await v.play();
            setAutoplayFailed(false);
        } catch (e) {
            console.error("수동 재생도 실패:", e);
        }
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
                            onLoadedMetadata={() => {
                                videoRef.current?.play().catch(() => setAutoplayFailed(true));
                            }}
                        />
                        {autoplayFailed && (
                            <button className={styles.playOverlay} onClick={handleManualPlay}>
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
