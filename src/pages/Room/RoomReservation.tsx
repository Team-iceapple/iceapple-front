import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Icon } from "@iconify/react";
import axios from "axios";

import baseStyles from "../Project/Project.module.css";
import reservationStyles from "./RoomReservation.module.css";
import Modal from "../../components/Modal/Modal.tsx";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}place/api`;

type Room = { id: string; name: string; description?: string };

const timeSlots = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

const formatDate = (d: Date) => {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
};

const RoomReservation = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    const [rooms, setRooms] = useState<Room[]>([]);
    const [date, setDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState<string[]>([]);
    const [availability, setAvailability] = useState<number[]>([]); // 0: 가능, 1: 예약됨
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [loadingAvail, setLoadingAvail] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedTime([]);
        setDate(new Date());
    };

    const isCapstoneRoom = useMemo(() => roomId === "capstone", [roomId]);

    useEffect(() => {
        const fetchRooms = async () => {
            setLoadingRooms(true);
            setError(null);
            try {
                const res = await axios.get(`${API_BASE_URL}/places`, {
                    headers: { Accept: "application/json" },
                });
                const list: Room[] = res.data?.places ?? [];
                setRooms(list);
            } catch (e) {
                setError("회의실 목록을 불러오지 못했습니다.");
                console.error(e);
            } finally {
                setLoadingRooms(false);
            }
        };
        fetchRooms();
    }, []);

    useEffect(() => {
        if (!roomId) return;
        const fetchAvailability = async () => {
            setLoadingAvail(true);
            setError(null);
            try {
                const res = await axios.get(
                    `${API_BASE_URL}/places/${roomId}?date=${formatDate(date)}`,
                    { headers: { Accept: "application/json" } }
                );
                const counts: number[] = res.data?.count ?? [];
                const filled = Array.from({ length: 10 }, (_, i) => counts[i] ?? 0);
                setAvailability(filled);
                setSelectedTime([]);
            } catch (e) {
                setError("예약 현황을 불러오지 못했습니다.");
                console.error(e);
                setAvailability(Array(10).fill(1));
            } finally {
                setLoadingAvail(false);
            }
        };
        fetchAvailability();
    }, [roomId, date]);

    return (
        <div className={baseStyles.container}>
            <div className={baseStyles.header}>
                <div className={baseStyles.titleRow}>
                    <Icon icon="lucide:calendar" className={baseStyles.icon} />
                    <h1 className={baseStyles.projectTitle}>공간 예약</h1>
                </div>
            </div>

            <div className={reservationStyles.layout}>
                <div className={reservationStyles.leftColumn}>
                    <div className={reservationStyles.buttonGroup}>
                        {loadingRooms ? (
                            <span className="text-muted">회의실 불러오는 중…</span>
                        ) : (
                            rooms.map((r) => (
                                <button
                                    key={r.id}
                                    className={`${reservationStyles.Button} ${
                                        r.id === roomId ? reservationStyles.activeButton : ""
                                    }`}
                                    onClick={() => navigate(`/rooms/${r.id}`)}
                                >
                                    {r.name}
                                </button>
                            ))
                        )}
                    </div>

                    <div className={reservationStyles.calendarWrapper}>
                        <Calendar
                            onChange={(value) => value instanceof Date && setDate(value)}
                            value={date}
                            locale="ko-KR"
                            formatDay={(_, d) => d.getDate().toString()}
                            calendarType="gregory"
                            prevLabel="<"
                            nextLabel=">"
                            prev2Label={null}
                            next2Label={null}
                            navigationLabel={({ date, locale }) =>
                                new Intl.DateTimeFormat(locale, { month: "long" }).format(date)
                            }
                        />
                    </div>
                </div>

                <div className={reservationStyles.tableWrapper}>
                    <div className={reservationStyles.scaledTableWrapper}>
                        <table className="table table-bordered table-hover align-middle text-center">
                            <thead className={reservationStyles.customHeader}>
                            <tr>
                                <th>선택</th>
                                <th>이용시간</th>
                                <th>상태</th>
                                {isCapstoneRoom && <th>잔여 좌석</th>}
                            </tr>
                            </thead>
                            <tbody>
                            {timeSlots.map((time, index) => {
                                const reserved = availability[index] === 1;
                                return (
                                    <tr key={index} className={reservationStyles.timeRow}>
                                        <td>
                                            <div className="form-check d-flex justify-content-center">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`time-${index}`}
                                                    value={time}
                                                    checked={selectedTime.includes(time)}
                                                    onChange={() => {
                                                        if (reserved) return;
                                                        setSelectedTime((prev) =>
                                                            prev.includes(time)
                                                                ? prev.filter((t) => t !== time)
                                                                : [...prev, time]
                                                        );
                                                    }}
                                                    disabled={reserved || loadingAvail}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <label htmlFor={`time-${index}`} className="form-check-label">
                                                {time}
                                            </label>
                                        </td>
                                        <td>
                                            {reserved ? (
                                                <span className="text-danger fw-semibold">예약됨</span>
                                            ) : (
                                                <span className="text-success fw-semibold">가능</span>
                                            )}
                                        </td>
                                        {isCapstoneRoom && <td>-</td>}
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    <div className={reservationStyles.reservationButton}>
                        <button
                            className={reservationStyles.Button}
                            onClick={() => setModalOpen(true)}
                            disabled={selectedTime.length === 0 || !roomId}
                        >
                            예약하기
                        </button>
                    </div>

                    {error && <div className="text-danger mt-2">{error}</div>}
                </div>
            </div>

            {modalOpen && (
                <Modal
                    onClose={handleCloseModal}
                    initialStep="reservation"
                    date={date}
                    selectedTimes={selectedTime}
                    roomName={rooms.find((r) => r.id === roomId)?.name || ""}
                    roomId={roomId!}
                />
            )}
        </div>
    );
};

export default RoomReservation;
