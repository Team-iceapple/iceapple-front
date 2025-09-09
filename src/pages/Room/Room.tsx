import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import baseStyles from "../Project/Project.module.css";
import roomStyles from "./Room.module.css";
import Modal from "../../components/Modal/Modal.tsx";
import { Icon } from "@iconify/react";
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}place/`;

interface Room {
    id: string;
    name: string;
    description: string;
}

const Room = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/places`);
                setRooms(res.data.places);
            } catch (err) {
                console.error("회의실 목록을 불러오지 못했습니다.", err);
            }
        };
        fetchRooms();
    }, []);

    const handleCardClick = (roomId: string) => {
        setSelectedRoom(roomId);
        navigate(`/rooms/${roomId}`);
    };

    return (
        <div className={baseStyles.container}>
            <div className={baseStyles.header}>
                <div className={baseStyles.titleRow}>
                    <Icon icon="lucide:calendar" className={baseStyles.icon} />
                    <h1 className={baseStyles.projectTitle}>회의실 예약</h1>
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
