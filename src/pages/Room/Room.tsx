import { useState } from "react";
import { useNavigate } from "react-router-dom";
import baseStyles from "../Project/Project.module.css";
import roomStyles from "./Room.module.css";
import Modal from "../../components/Modal/Modal.tsx";
import { Icon } from "@iconify/react";

const rooms = [
    {
        id: "capstone",
        name: "캡스톤실",
        description: "LED TV 미러링, 칠판, 4인 테이블\n해당 회의실은 선착순 배정입니다.",
    },
    {
        id: "lecture",
        name: "강의실",
        description: "LED TV 미러링, 전자칠판, 30인",
    },
    {
        id: "seminar",
        name: "세미나실",
        description: "LED TV 미러링, 칠판, 7인",
    },
];

const Room = () => {
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleCardClick = (roomId: string) => {
        setSelectedRoom(roomId);
        navigate(`/rooms/${roomId}`);
    };

    return (
        <div className={baseStyles.projectContainer}>
            <div className={baseStyles.header}>
                <div className={baseStyles.titleRow}>
                    <Icon icon="lucide:calendar" className={baseStyles.icon} />
                    <h1 className={baseStyles.projectTitle}>공간 예약</h1>
                </div>
            </div>

            <div className={roomStyles.roomContainer}>
                {rooms.map((room) => (
                    <div
                        key={room.id}
                        className={`${roomStyles.roomCard} ${selectedRoom === room.id ? roomStyles.selected : ""}`}
                        onClick={() => handleCardClick(room.id)}
                    >
                        <h2 className={roomStyles.roomTitle}>{room.name}</h2>
                        <p className={roomStyles.roomDesc}>{room.description}</p>
                    </div>
                ))}
            </div>

            <div className={roomStyles.buttonWrapper}>
                <button
                    className={roomStyles.myReservationBtn}
                    onClick={() => setIsModalOpen(true)}
                >
                    나의 예약 조회 / 취소
                </button>
            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)} initialStep="login" />
            )}

        </div>
    );
};

export default Room;
