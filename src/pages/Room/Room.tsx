import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import baseStyles from "../Project/Project.module.css";
import roomStyles from "./Room.module.css";
import noticeStyles from "../Notice/Notice.module.css";
import Modal from "../../components/Modal/Modal.tsx";
import { Icon } from "@iconify/react";
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}place/`;

interface Room {
    id: string;
    name: string;
    description: string;
}

const chunk = <T,>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
    );

const PAGE_SIZE = 3;

const Room = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/places`);
                setRooms(res.data.places ?? []);
            } catch (err) {
                console.error("회의실 목록을 불러오지 못했습니다.", err);
            }
        };
        fetchRooms();
    }, []);

    const roomsOrdered = useMemo(
        () =>
            [...rooms].sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
            ),
        [rooms]
    );

    const roomChunks = useMemo(() => chunk(roomsOrdered, PAGE_SIZE), [roomsOrdered]);
    const totalSlides = roomChunks.length;

    useEffect(() => {
        setCurrentIndex(0);
    }, [totalSlides]);

    const handleCardClick = (roomId: string) => {
        setSelectedRoom(roomId);
        navigate(`/rooms/${roomId}`);
    };

    const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));
    const goNext = () => setCurrentIndex((i) => Math.min(i + 1, Math.max(totalSlides - 1, 0)));

    const currentRooms = roomChunks[currentIndex] ?? [];

    return (
        <div className={baseStyles.container}>
            <div className={baseStyles.header}>
                <div className={baseStyles.titleRow}>
                    <Icon icon="lucide:calendar" className={baseStyles.icon} />
                    <h1 className={baseStyles.projectTitle}>회의실 예약</h1>
                </div>
            </div>

            <div className={roomStyles.roomFrame}>
                {currentIndex > 0 && (
                    <button
                        type="button"
                        aria-label="이전 회의실 페이지"
                        className={`${noticeStyles["navArrow"]} ${noticeStyles["navLeft"]} ${roomStyles.arrowFix}`}
                        onClick={goPrev}
                    >
                        <Icon icon="lucide:chevron-left" />
                    </button>
                )}

                <div className={roomStyles.roomContainer}>
                    {currentRooms.map((room) => (
                        <div
                            key={room.id}
                            className={`${roomStyles.roomCard} ${
                                selectedRoom === room.id ? roomStyles.selected : ""
                            }`}
                            onClick={() => handleCardClick(room.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") handleCardClick(room.id);
                            }}
                        >
                            <h2 className={roomStyles.roomTitle}>{room.name}</h2>
                            <p className={roomStyles.roomDesc}>{room.description}</p>
                        </div>
                    ))}
                </div>

                {currentIndex < totalSlides - 1 && (
                    <button
                        type="button"
                        aria-label="다음 회의실 페이지"
                        className={`${noticeStyles["navArrow"]} ${noticeStyles["navRight"]} ${roomStyles.arrowFix}`}
                        onClick={goNext}
                    >
                        <Icon icon="lucide:chevron-right" />
                    </button>
                )}
            </div>

            <div className={roomStyles.buttonWrapper}>
                <button className={roomStyles.myReservationBtn} onClick={() => setIsModalOpen(true)}>
                    나의 예약 조회 / 취소
                </button>
            </div>

            {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} initialStep="login" />}
        </div>
    );
};

export default Room;