import {type ChangeEvent, useEffect, useMemo, useRef, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Icon } from "@iconify/react";
import axios from "axios";

import baseStyles from "../Project/Project.module.css";
import reservationStyles from "./RoomReservation.module.css";
import Modal from "../../components/Modal/Modal";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}place/`;

type Room = { id: string; name: string; description?: string };

const timeSlots = [
    "09:00","10:00","11:00","12:00","13:00",
    "14:00","15:00","16:00","17:00","18:00"
];
const MAX_SLOTS = 3;

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
    const [availability, setAvailability] = useState<number[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [loadingAvail, setLoadingAvail] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const [toast, setToast] = useState<{ msg: string; x: number; y: number } | null>(null);
    const toastTimerRef = useRef<number | null>(null);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedTime([]);
        setDate(new Date());
    };

    const isCapstoneRoom = useMemo(() => roomId === "capstone", [roomId]);

    const notifyAt = (msg: string, x: number, y: number) => {
        setToast({ msg, x, y });
        if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = window.setTimeout(() => setToast(null), 1500);
    };

    const notifyAboveElement = (
        e : React.MouseEvent<HTMLInputElement, MouseEvent>|ChangeEvent<HTMLInputElement>,
        msg: string
    ) => {
        const el = e.currentTarget as HTMLElement;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const topY = rect.top;
        const OFFSET = 12;
        notifyAt(msg, centerX, topY - OFFSET);
    };

    const tryToggleTime = (
        _e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
        time: string,
        index: number
    ) => {
        const reserved = availability[index] === 1;
        const checked = selectedTime.includes(time);

        if (isBlocked(checked, reserved)) {
            notifyAt(`최대 ${MAX_SLOTS}개까지만 선택할 수 있어요.`, window.innerWidth / 2, 120);
            return;
        }
        if (reserved || loadingAvail) return;

        setSelectedTime(prev => (checked ? prev.filter(t => t !== time) : [...prev, time]));
    };

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

    const canPickMore = selectedTime.length < MAX_SLOTS;

    const isBlocked = (checked: boolean, reserved: boolean) =>
        !checked && !canPickMore && !reserved && !loadingAvail;

    return (
        <div className={baseStyles.container}>
            <div className={baseStyles.header}>
                <div className={baseStyles.titleRow}>
                    <Icon icon="lucide:calendar" className={baseStyles.icon} />
                    <h1 className={baseStyles.projectTitle}>회의실 예약</h1>
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
                                    className={`${reservationStyles.Button} ${r.id === roomId ? reservationStyles.activeButton : ""}`}
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
                            calendarType="iso8601"
                            prevLabel="<"
                            nextLabel=">"
                            prev2Label={null}
                            next2Label={null}
                            minDate={startOfToday}
                            tileDisabled={({ date, view }) =>
                                view === "month" && (date.getDay() === 0 || date.getDay() === 6)
                            }
                            tileClassName={({ date: d, view }) => {
                                if (view === "month" && d.toDateString() === new Date().toDateString()) {
                                    return "today-tile";
                                }
                                return null;
                            }}
                            tileContent={({ date: d, view }) =>
                                view === "month" && d.toDateString() === new Date().toDateString() ? (
                                    <div className="today-label">오늘</div>
                                ) : null
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
                                const checked = selectedTime.includes(time);

                                return (
                                    <tr
                                        key={index}
                                        className={reservationStyles.timeRow}
                                        onClick={(e) => tryToggleTime(e, time, index)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                tryToggleTime(e, time, index);
                                            }
                                        }}
                                        tabIndex={0}
                                        aria-checked={selectedTime.includes(time)}
                                        role="row"
                                        style={{
                                            cursor: availability[index] === 1 || loadingAvail ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        <td>
                                            <div className="form-check d-flex justify-content-center">
                                                <input
                                                    className={`form-check-input ${
                                                        !checked && !canPickMore ? reservationStyles.softDisabled : ""
                                                    }`}
                                                    type="checkbox"
                                                    id={`time-${index}`}
                                                    value={time}
                                                    checked={checked}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isBlocked(checked, reserved)) {
                                                            e.preventDefault();
                                                            notifyAboveElement(e, `최대 ${MAX_SLOTS}개까지만 선택할 수 있어요.`);
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        if (isBlocked(checked, reserved)) {
                                                            notifyAboveElement(e, `최대 ${MAX_SLOTS}개까지만 선택할 수 있어요.`);
                                                            return;
                                                        }
                                                        if (reserved || loadingAvail) return;
                                                        setSelectedTime((prev) => (checked ? prev.filter((t) => t !== time) : [...prev, time]));
                                                    }}
                                                    disabled={reserved || loadingAvail}
                                                    aria-disabled={!checked && !canPickMore}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <label
                                                htmlFor={`time-${index}`}
                                                className="form-check-label"
                                                onClick={(e) => e.stopPropagation()}
                                            >
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

            {toast && (
                <div
                    className={reservationStyles.toast}
                    role="status"
                    aria-live="polite"
                    style={{
                        position: "fixed",
                        top: Math.max(8, toast.y),
                        left: toast.x,
                        transform: "translate(-50%, -100%)",
                        backgroundColor: "rgba(0, 0, 0, 0.78)",
                        color: "white",
                        padding: "8px 14px",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        zIndex: 3000,
                        pointerEvents: "none",
                        boxShadow: "0 6px 20px rgba(0,0,0,.22)",
                        transition: "opacity .2s ease",
                        opacity: 1,
                        whiteSpace: "nowrap",
                    }}
                >
                    {toast.msg}
                </div>
            )}

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