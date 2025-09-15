import { useEffect, useState } from "react";
import styles from "./footer.module.css";
import type { NoticeItem } from "../../pages/Notice/Notice";

import footerMegaphone from "../../../assets/footer-megaphone.svg";
import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");

export const Footer = () => {
    const [now, setNow] = useState(dayjs());
    const [weather, setWeather] = useState<{
        temp: number;
        description: string;
        icon: string;
    } | null>(null);

    const [pinnedNotices, setPinnedNotices] = useState<string[]>([]);
    const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(dayjs());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
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

    useEffect(() => {
        const fetchPinnedNotices = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}notice/mobile`);
                const data: { mobiles: NoticeItem[] } = await res.json();
                const pins = data.mobiles
                    .filter((n) => n.is_pin)
                    .map((n) => n.title);
                setPinnedNotices(pins);
            } catch (err) {
                console.error("공지사항 불러오기 실패", err);
            }
        };
        fetchPinnedNotices();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentNoticeIndex((prev) =>
                pinnedNotices.length > 0 ? (prev + 1) % pinnedNotices.length : 0
            );
        }, 2000);
        return () => clearInterval(interval);
    }, [pinnedNotices]);

    return (
        <footer className={styles.footer}>
            <div className={styles["notice-section"]}>
                <img src={footerMegaphone} className={styles["footer-megaphone"]} />
                <span className={styles["notice-label"]}>주요 공지사항</span>
                <p className={styles["footer-pin-body"]}>
                    {pinnedNotices.length > 0
                        ? pinnedNotices[currentNoticeIndex]
                        : "공지사항 없음"}
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
                    <div className={styles["weather-temp"]}>
                        {weather ? `${weather.temp}°C` : ""}
                    </div>
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
