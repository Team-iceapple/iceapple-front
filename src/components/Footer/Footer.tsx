import footerMegaphone from "../../../assets/footer-megaphone.png";
import styles from "./footer.module.css";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import 'dayjs/locale/ko';
dayjs.locale('ko');

interface WeatherData {
    main: {
        temp: number;
    };
    weather: {
        description: string;
        icon: string;
    }[];
}

export const Footer = (): JSX.Element => {
    const [now, setNow] = useState(dayjs());
    const [weather, setWeather] = useState<{
        temp: number,
        description: string,
        icon: string;
    } | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(dayjs());
        }, 1000) // 시간 건들지 마세요!!
        return () => clearInterval(interval);
    }, []);

    useEffect (() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=Seoul&units=metric&lang=kr&appid=e5a087bda87fdc9633fec66e11bfa928`
                );
                const data = await res.json();
                setWeather({
                    temp: Math.round(data.main.temp),
                    description: data.weather[0].description,
                    icon: data.weather[0].icon,
                });
            } catch (err) {
                console.error("날씨 뷸러오기 실패", err);
            }
        };

        fetchWeather();
    }, []);

    return (
            <footer className={styles.footer}>
                <div className={styles.state}>
                    <div className={styles["state-group"]}>
                        <div className={styles["footer-today"]}>
                            <div className={styles["footer-date"]}>
                                {now.format("YYYY년 M월 D일 dddd")}
                            </div>
                            <div className={styles["footer-time"]}>
                                {now.format("A hh:mm:ss")}
                            </div>
                        </div>

                        <div className={styles["footer-weather"]}>
                            <div className={styles.div}>
                                <div className={styles["text-wrapper"]}>
                                    {weather?.description || "날씨 로딩 중"}
                                </div>
                                <img
                                    src={`https://openweathermap.org/img/wn/${weather?.icon}@2x.png`}
                                    alt="날씨 아이콘"
                                    className={styles["footer-weather-icon"]}
                                />
                            </div>
                            <div className={styles["footer-weather-temperature"]}>
                                {weather ? `${weather.temp}°C` : ""}
                            </div>
                        </div>
                    </div>

                    <div className={styles["pinNotice"]}>
                        <p className={styles["footer-pin-body"]}>
                            [진로설계 수강생 필수] 2025학년도 1학기 핵심역량진단 실시 안내
                        </p>
                        <div className={styles["footer-pin-header"]}>주요 공지사항</div>
                    </div>

                    <img
                        className={styles["footer-megaphone"]}
                        alt="Footer megaphone"
                        src={footerMegaphone}
                    />
                </div>
            </footer>

    );
};
