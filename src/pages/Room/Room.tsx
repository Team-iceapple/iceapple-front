import { useState } from "react";
import { useNavigate } from "react-router-dom";
import baseStyles from "../Project/Project.module.css";
import roomStyles from "./Room.module.css";
import Modal from "../../components/Modal/Modal.tsx";
import { Icon } from "@iconify/react";
import { rooms } from "../../data/rooms.ts";


const Room = () => {
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleCardClick = (roomId: string) => {
        setSelectedRoom(roomId);
        navigate(`/rooms/${roomId}`);
    };

    return (
        <div className={baseStyles.container}>
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
                <Modal onClose={() => setIsModalOpen(false)} initialStep="manageReservation" />
            )}

        </div>
    );
};

export default Room;
