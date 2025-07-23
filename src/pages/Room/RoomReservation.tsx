import {useParams, useNavigate} from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {Icon} from "@iconify/react";
import baseStyles from "../Project/Project.module.css";
import reservationStyles from "./RoomReservation.module.css";
import {useState} from "react";
import { rooms } from "../../data/rooms.ts"
import { timeSlots, mockAvailability as availability } from "../../data/reservation";


const RoomReservation = () => {
    const {roomId} = useParams<{ roomId: string }>();
    const [date, setDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const navigate = useNavigate();

    return (
        <div className={baseStyles.container}>
            <div className={baseStyles.header}>
                <div className={baseStyles.titleRow}>
                    <Icon icon="lucide:calendar" className={baseStyles.icon}/>
                    <h1 className={baseStyles.projectTitle}>공간 예약</h1>
                </div>
            </div>

            <div className={reservationStyles.layout}>
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
                        navigationLabel={({date, locale}) =>
                            new Intl.DateTimeFormat(locale, {month: 'long'}).format(date)
                        }
                    />
                </div>

                <table className="table table-bordered table-hover align-middle mt-4">
                    <thead className="table-light">
                    <tr>
                        <th scope="col" style={{ width: "80px" }}>선택</th>
                        <th scope="col">이용시간</th>
                        <th scope="col">상태</th>
                    </tr>
                    </thead>
                    <tbody>
                    {timeSlots.map((time, index) => (
                        <tr key={index}>
                            <td>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="selectedTime"
                                        id={`time-${index}`}
                                        value={time}
                                        checked={selectedTime === time}
                                        onChange={() => setSelectedTime(time)}
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
                        </tr>
                    ))}
                    </tbody>
                </table>

            </div>

        </div>
    );
};

export default RoomReservation;
