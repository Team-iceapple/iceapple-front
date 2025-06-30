import { useEffect, useState } from "react";
import styles from "./Home.module.css";

const Home = () => {
    const [videoUrl, setVideoUrl] = useState<string>("");

    useEffect(() => {
        fetch("/api/admin/video-url") // API 주소
            .then((res) => res.json())
            .then((data) => {
                setVideoUrl(data.url);
            });
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.videoWrapper}>
                {videoUrl ? (
                    <video
                        src={videoUrl}
                        controls
                        autoPlay
                        loop
                        muted
                        className={styles.video}
                    />
                ) : (
                    <img
                        src="https://via.placeholder.com/800x450?text=동영상+자리"
                        alt="동영상 자리"
                        className={styles.video}
                    />
                )}
            </div>
        </div>
    );
};

export default Home;
