import type React from "react";
import { type ChangeEvent, useEffect, useRef, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Icon } from "@iconify/react";
import axios from "axios";

import baseStyles from "../Project/Project.module.css";
import reservationStyles from "./RoomReservation.module.css";
import Modal from "../../components/Modal/Modal";
import { isReservationEnabled } from "../../utils/reservationFlag";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}place/`;

type Room = { id: string; name: string; description?: string };

const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
];

const MAX_SLOTS = 3;
const DEFAULT_SEATS_PER_SLOT = 4;

const clamp = (n: number, min = 0) => (n < min ? min : n);
const remainingOf = (count: number, cap: number) => clamp(cap - count, 0);
const isFullByCount = (count: number, cap: number) => remainingOf(count, cap) === 0;

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
    const [countMode, setCountMode] = useState(false);

    const [seatsPerSlot, setSeatsPerSlot] = useState<number>(DEFAULT_SEATS_PER_SLOT);

    const [toast, setToast] = useState<{ msg: string; x: number; y: number } | null>(null);
    const toastTimerRef = useRef<number | null>(null);

    const PAGE_SIZE = 3;
    const [page, setPage] = useState(0);

    const pageCount = Math.ceil(rooms.length / PAGE_SIZE);
    const startIndex = page * PAGE_SIZE;
    const visibleRooms = rooms.slice(startIndex, startIndex + PAGE_SIZE);

    const goPrev = () => setPage((p) => Math.max(0, p - 1));
    const goNext = () => setPage((p) => Math.min(pageCount - 1, p + 1));

    const showGhost = rooms.length <= PAGE_SIZE;
    const canPrev = page > 0 && !showGhost;
    const canNext = page < pageCount - 1 && !showGhost;

    const reservationEnabled = isReservationEnabled();

    useEffect(() => {
        if (!rooms.length || !roomId) return;
        const idx = rooms.findIndex((r) => r.id === roomId);
        if (idx >= 0) {
            const targetPage = Math.floor(idx / PAGE_SIZE);
            if (targetPage !== page) setPage(targetPage);
        }
    }, [rooms, roomId]);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const isPastTime = (timeSlot: string) => {
        const today = new Date();
        const [hour, minute] = timeSlot.split(":").map(Number);

        const isToday = formatDate(date) === formatDate(today);

        if (!isToday) return false;

        const slotStart = new Date(today);
        slotStart.setHours(hour, minute, 0, 0);

        return slotStart <= today;
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedTime([]);
        setDate(new Date());
    };

    const notifyAt = (msg: string, x: number, y: number) => {
        setToast({ msg, x, y });
        if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = window.setTimeout(() => setToast(null), 1500);
    };

    const notifyAboveElement = (
        e: React.MouseEvent<HTMLInputElement, MouseEvent> | ChangeEvent<HTMLInputElement>,
        msg: string
    ) => {
        const el = e.currentTarget as HTMLElement;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const topY = rect.top;
        const OFFSET = 12;
        notifyAt(msg, centerX, topY - OFFSET);
    };

    const canPickMore = selectedTime.length < MAX_SLOTS;
    const isBlocked = (checked: boolean, isFull: boolean) =>
        !checked && !canPickMore && !isFull && !loadingAvail;

    const tryToggleTime = (
        _e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
        time: string,
        index: number
    ) => {
        const current = availability[index] ?? 0;
        const isFull = countMode ? isFullByCount(current, seatsPerSlot) : current === 1;
        const checked = selectedTime.includes(time);

        if (isBlocked(checked, isFull)) {
            notifyAt(`최대 ${MAX_SLOTS}개까지만 선택할 수 있어요.`, window.innerWidth / 2, 120);
            return;
        }
        if (isFull || loadingAvail) return;

        setSelectedTime((prev) => (checked ? prev.filter((t) => t !== time) : [...prev, time]));
    };

    useEffect(() => {
        const fetchRooms = async () => {
            setLoadingRooms(true);
            setError(null);
            try {
                const res = await axios.get(`${API_BASE_URL}places`, {
                    headers: { Accept: "application/json" },
                });
                const list: Room[] = res.data?.places ?? [];

                const sortedList = list.sort((a, b) => {
                    const numA = parseInt(a.name.match(/\d+/g)?.pop() || '0', 10);
                    const numB = parseInt(b.name.match(/\d+/g)?.pop() || '0', 10);

                    return numA - numB;
                });

                setRooms(sortedList);
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
                    `${API_BASE_URL}places/${roomId}?date=${formatDate(date)}`,
                    { headers: { Accept: "application/json" } }
                );

                const counts: number[] = res.data?.count ?? [];
                const filled = Array.from({ length: timeSlots.length }, (_, i) => counts[i] ?? 0);
                setAvailability(filled);

                const maxCountFromApi =
                    res.data?.maxCount ??
                    res.data?.max_count ??
                    res.data?.["max-count"] ??
                    res.data?.seatsPerSlot ??
                    res.data?.capacity;

                setSeatsPerSlot(
                    typeof maxCountFromApi === "number" && maxCountFromApi > 0
                        ? maxCountFromApi
                        : DEFAULT_SEATS_PER_SLOT
                );

                setCountMode(Array.isArray(res.data?.count));
                setSelectedTime([]);
            } catch (e) {
                setError("예약 현황을 불러오지 못했습니다.");
                console.error(e);
                setAvailability(Array(timeSlots.length).fill(DEFAULT_SEATS_PER_SLOT));
                setSeatsPerSlot(DEFAULT_SEATS_PER_SLOT);
                setCountMode(true);
            } finally {
                setLoadingAvail(false);
            }
        };
        fetchAvailability();
    }, [roomId, date]);


    const minAvailableSeats = selectedTime.reduce((minSeats, time) => {
        const index = timeSlots.indexOf(time);

        if (index === -1 || !countMode) return minSeats;

        const currentCount = availability[index] ?? 0;
        const remaining = remainingOf(currentCount, seatsPerSlot);

        return Math.min(minSeats, remaining);
    }, seatsPerSlot);


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
                            <>
                                <button
                                    type="button"
                                    onClick={goPrev}
                                    disabled={!canPrev}
                                    aria-label="이전 회의실"
                                    className={`${reservationStyles.arrowBtn} ${!canPrev ? reservationStyles.ghost : ""}`}
                                >
                                    &lt;
                                </button>

                                <div className={reservationStyles.roomWindow} role="list">
                                    {visibleRooms.map((r) => (
                                        <button
                                            role="listitem"
                                            key={r.id}
                                            className={`${reservationStyles.Button} ${r.id === roomId ? reservationStyles.activeButton : ""}`}
                                            onClick={() => navigate(`/rooms/${r.id}`)}
                                        >
                                            {r.name}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={goNext}
                                    disabled={!canNext}
                                    aria-label="다음 회의실"
                                    className={`${reservationStyles.arrowBtn} ${!canNext ? reservationStyles.ghost : ""}`}
                                >
                                    &gt;
                                </button>
                            </>
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
                                {countMode && <th>잔여 좌석</th>}
                            </tr>
                            </thead>
                            <tbody>
                            {timeSlots.map((time, index) => {
                                const current = availability[index] ?? 0;
                                const full = countMode ? isFullByCount(current, seatsPerSlot) : current === 1;
                                const remain = countMode ? remainingOf(current, seatsPerSlot) : 0;
                                const checked = selectedTime.includes(time);

                                const isPast = isPastTime(time);
                                const isDisabled = full || loadingAvail || isPast;

                                return (
                                    <tr
                                        key={index}
                                        className={`${reservationStyles.timeRow} ${isPast ? reservationStyles.pastTimeRow : ''}`}
                                        onClick={(e) => {
                                            if (isDisabled) return;
                                            tryToggleTime(e, time, index);
                                        }}
                                        onKeyDown={(e) => {
                                            if (isDisabled) return;
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                tryToggleTime(e, time, index);
                                            }
                                        }}
                                        tabIndex={isDisabled ? -1 : 0}
                                        aria-checked={checked}
                                        role="row"
                                        style={{
                                            cursor: isDisabled ? "not-allowed" : "pointer",
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
                                                        if (isDisabled || isBlocked(checked, full)) {
                                                            e.preventDefault();
                                                            notifyAboveElement(e, isDisabled && isPast ? '이미 지난 시간이에요.' : `최대 ${MAX_SLOTS}개까지만 선택할 수 있어요.`);
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        if (isDisabled || isBlocked(checked, full)) {
                                                            notifyAboveElement(e, isDisabled && isPast ? '이미 지난 시간이에요.' : `최대 ${MAX_SLOTS}개까지만 선택할 수 있어요.`);
                                                            return;
                                                        }
                                                        if (full || loadingAvail) return;
                                                        setSelectedTime((prev) =>
                                                            checked ? prev.filter((t) => t !== time) : [...prev, time]
                                                        );
                                                    }}
                                                    disabled={isDisabled}
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
                                            {isPast ? (
                                                <span className="text-danger fw-semibold">예약 불가</span>
                                            ) : full ? (
                                                <span className="text-danger fw-semibold">예약 마감</span>
                                            ) : (
                                                <span className="text-success fw-semibold">가능</span>
                                            )}
                                        </td>
                                        {countMode && <td>{remain} / {seatsPerSlot}</td>}
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
                            disabled={!reservationEnabled || selectedTime.length === 0 || !roomId}
                        >
                            예약하기
                        </button>
                        {!reservationEnabled && (
                            <div className="text-muted mt-2" role="note">
                                특수 링크로 접근해야 예약하기 버튼이 활성화됩니다. URL에 <code>?reserve=on</code>을 포함해 접속하세요.
                            </div>
                        )}
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
                    seatsPerSlot={seatsPerSlot}
                    minAvailableSeats={minAvailableSeats}
                />
            )}
        </div>
    );
};

export default RoomReservation;