import {useParams, useNavigate} from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {Icon} from "@iconify/react";
import baseStyles from "../Project/Project.module.css";
import reservationStyles from "./RoomReservation.module.css";
import {useState} from "react";
import { rooms } from "../../data/rooms.ts"
import { timeSlots, mockAvailability as availability, mockSeatCount as remainingSeats } from "../../data/reservation";

const RoomReservation = () => {
    const {roomId} = useParams<{ roomId: string }>();
    const [date, setDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState<string[]>([]);
    const navigate = useNavigate();
    const isCapstoneRoom = roomId === "capstone";


    return (
        <div className={baseStyles.container}>
            <div className={baseStyles.header}>
                <div className={baseStyles.titleRow}>
                    <Icon icon="lucide:calendar" className={baseStyles.icon}/>
                    <h1 className={baseStyles.projectTitle}>공간 예약</h1>
                </div>
            </div>

            <div className={reservationStyles.layout}>
                <div className={reservationStyles.leftColumn}>
                    <div className={reservationStyles.buttonGroup}>
                        {rooms.map((r) => (
                            <button
                                key={r.id}
                                className={`${reservationStyles.Button} ${r.id === roomId ? reservationStyles.activeButton : ""}`}
                                onClick={() => navigate(`/rooms/${r.id}`)}
                            >
                                {r.name}
                            </button>
                        ))}
                    </div>

                    <div className={reservationStyles.calendarWrapper}>
                        <Calendar
                            onChange={(value) => {
                                if (value instanceof Date) setDate(value);
                            }}
                            value={date}
                            locale="ko-KR"
                            formatDay={(_, date) => date.getDate().toString()}
                            calendarType="gregory"
                            prevLabel="<"
                            nextLabel=">"
                            prev2Label={null}
                            next2Label={null}
                            navigationLabel={({ date, locale }) =>
                                new Intl.DateTimeFormat(locale, { month: 'long' }).format(date)
                            }
                        />
                    </div>
                </div>

                <div className={reservationStyles.tableWrapper}>
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
                        {timeSlots.map((time, index) => (
                            <tr key={index} className={reservationStyles.timeRow}>
                            <td>
                                    <div className="form-check d-flex justify-content-center">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="selectedTimes"
                                            id={`time-${index}`}
                                            value={time}
                                            checked={selectedTime?.includes(time)}
                                            onChange={() => {
                                                if (!availability[time]) return;

                                                setSelectedTime((prev) => {
                                                    return prev.includes(time)
                                                        ? prev.filter((t: string) => t !== time)
                                                        : [...prev, time];
                                                });
                                            }}
                                            disabled={!availability[time]}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <label htmlFor={`time-${index}`} className="form-check-label">
                                        {time}
                                    </label>
                                </td>
                                <td>
                                    {availability[time] ? (
                                        <span className="text-success fw-semibold">가능</span>
                                    ) : (
                                        <span className="text-danger fw-semibold">예약됨</span>
                                    )}
                                </td>
                                {isCapstoneRoom && <td>{remainingSeats[time] ?? "-"}</td>}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <div className={reservationStyles.reservationButton}>
                        <button className={reservationStyles.Button}>
                            예약하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomReservation;
