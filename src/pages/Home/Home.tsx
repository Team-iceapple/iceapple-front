import { useEffect, useRef, useState } from "react";
import styles from "./Home.module.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = new URL(API_BASE);
const ORIGIN = API.origin;
const BASE_PATH = API.pathname.replace(/\/$/, "");
const VIDEOS_API = `${ORIGIN}${BASE_PATH}/home/videos`;

function buildMediaUrl(fileUrl: string) {
    if (!fileUrl) return "";
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

    const cleaned = fileUrl.replace(/^\.?\//, "");
    if (cleaned.startsWith("media/")) {
        return `${ORIGIN}${BASE_PATH}/home/${cleaned}`;
    }

    if (fileUrl.startsWith("/")) {
        return `${ORIGIN}${BASE_PATH}${fileUrl}`;
    }
    return `${ORIGIN}${BASE_PATH}/${cleaned}`.replace(/([^:]\/)\/+/g, "$1");
}

const Home = () => {
    const [videoUrl, setVideoUrl] = useState("");
    const [autoplayFailed, setAutoplayFailed] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        let abort = false;
        fetch(`${VIDEOS_API}/current`)
            .then(async (res) => {
                if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    throw new Error(`[${res.status}] ${res.statusText} ${txt}`);
                }
                return res.json();
            })
            .then((data) => {
                if (abort) return;
                const raw = data?.fileUrl;
                const abs = buildMediaUrl(raw);
                setVideoUrl(abs);
            })
            .catch((err) => console.error("비디오 로드 실패:", err));
        return () => { abort = true; };
    }, []);

    useEffect(() => {
        const v = videoRef.current;
        if (!v || !videoUrl) return;
        v.muted = true; v.playsInline = true; v.autoplay = true;

        const tryPlay = async () => {
            try { await v.play(); setAutoplayFailed(false); }
            catch {
                const onMeta = async () => {
                    v.removeEventListener("loadedmetadata", onMeta);
                    try { await v.play(); setAutoplayFailed(false); }
                    catch { setAutoplayFailed(true); }
                };
                v.addEventListener("loadedmetadata", onMeta);
            }
        };
        tryPlay();
    }, [videoUrl]);

    return (
        <div className={styles.container}>
            <div className={styles.videoWrapper}>
                {videoUrl ? (
                    <>
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            autoPlay muted loop playsInline preload="auto"
                            className={styles.video}
                            onLoadedMetadata={() =>
                                videoRef.current?.play().catch(() => setAutoplayFailed(true))
                            }
                            onError={() => console.error("video 태그 에러:", videoUrl)}
                        />
                        {autoplayFailed && (
                            <button className={styles.playOverlay}
                                    onClick={() => videoRef.current?.play()}>
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
