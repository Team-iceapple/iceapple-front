import footerMegaphone from "../../../assets/footer-megaphone.svg";
import styles from "./footer.module.css";

import {type JSX, useEffect, useState} from "react";
import dayjs from "dayjs";
import 'dayjs/locale/ko';
dayjs.locale('ko');

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
                    `https://api.openweathermap.org/data/2.5/weather?q=Daejeon&units=metric&lang=kr&appid=e5a087bda87fdc9633fec66e11bfa928`
                );
                const data = await res.json();
                setWeather({
                    temp: Math.round(data.main.temp),
                    description: data.weather[0].description,
                    icon: data.weather[0].icon,
                });
            } catch (err) {
                console.error("날씨 불러오기 실패", err);
            }
        };

        fetchWeather();
    }, []);

    return (
        <footer className={styles.footer}>
            <div className={styles["notice-section"]}>
                <img src={footerMegaphone} className={styles["footer-megaphone"]} />
                <span className={styles["notice-label"]}>주요 공지사항</span>
                <p className={styles["footer-pin-body"]}>
                    [진로설계 수강생 필수] 2025학년도 1학기 핵심역량진단 실시 안내
                </p>
            </div>

            <div className={styles["footer-right"]}>
                <div className={styles["datetime"]}>
                    <div className={styles["footer-date"]}>
                        {now.format("YYYY년 M월 D일 dddd")}
                    </div>
                    <div className={styles["footer-time"]}>
                        {now.format("A hh:mm:ss")}
                    </div>
                </div>
                <div className={styles["weather"]}>
                    <div className={styles["weather-temp"]}>{weather ? `${weather.temp}°C` : ""}</div>
                    <div className={styles["weather-desc"]}>
                        {weather?.description}
                        {weather?.icon && (
                            <img
                                src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                                alt="날씨 아이콘"
                                className={styles["weather-icon"]}
                            />
                        )}
                    </div>
                </div>
            </div>
        </footer>

    );
};
