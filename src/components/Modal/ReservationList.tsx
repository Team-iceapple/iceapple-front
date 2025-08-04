import { useState } from "react";
import styles from "./Modal.module.css";

const dummyReservations = [
    {
        id: 1,
        date: "5월 16일(금)",
        times: ["16:00~17:00", "17:00~18:00", "18:00~19:00", "19:00~20:00"],
        room: "캡스톤실",
    },
    {
        id: 2,
        date: "12월 10일 (토)",
        times: ["10:00 ~ 12:00"],
        room: "세미나실",
    },
];

const ReservationList = ({
                             studentId,
                             setStep,
                             setCancelledData,
                         }: {
    studentId: string;
    setStep: (s: "login" | "loginError" | "reservationList" | "CancelSuccess") => void;
    setCancelledData: (data: { date: string; times: string[]; room: string }[]) => void;
}) => {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleCancel = () => {
        if (selectedIds.length > 0) {
            const cancelled = dummyReservations.filter((res) => selectedIds.includes(res.id));
            setCancelledData(cancelled);
            setStep("CancelSuccess");
        }
    };

    const handleToggle = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    return (
        <>
            <div>
                <div className={styles.confirmationId}>{studentId} 님의 예약 내역</div>

                <div className={styles.reservationList}>
                    {dummyReservations.map((res) => (
                        <label key={res.id}>
                            <div className={styles.reservationInfo}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={selectedIds.includes(res.id)}
                                    onChange={() => handleToggle(res.id)}
                                />
                                <div className={styles.dateColumn}>{res.date}</div>
                                <div className={styles.timeColumn}>
                                    {res.times.map((t, i) => (
                                        <div key={i}>{t}</div>
                                    ))}
                                </div>
                                <div className={styles.roomColumn}>{res.room}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className={styles.buttonSection}>
                <button
                    className={styles.submitBtn}
                    onClick={handleCancel}
                    disabled={selectedIds.length === 0}
                >
                    선택 예약 취소
                </button>
            </div>
        </>
    );
};

export default ReservationList;