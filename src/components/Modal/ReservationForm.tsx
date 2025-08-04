import {useState} from "react";
import styles from "./Modal.module.css";

const ReservationForm = ({
                             date,
                             selectedTimes,
                             roomName,
                         }: {
    date: Date;
    selectedTimes: string[];
    roomName: string;
}) => {
    const [studentId, setStudentId] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [showError, setShowError] = useState(false);

    const formattedDate = new Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
    }).format(date);

    const handleSubmit = () => {
        if (!studentId || !phone || password.length !== 4) {
            setShowError(true);
            return;
        }

        setShowError(false);
        setIsConfirmed(true);
    };

    if (isConfirmed) {
        return (
            <div className={styles.confirmationBox}>
                <div className={styles.confirmationId}>{studentId} 님의</div>

                <div className={styles.confirmationDetails}>
                    <strong>{formattedDate}</strong>

                    {selectedTimes.map((_, i) =>
                        i % 2 === 0 ? (
                            <div key={i} className={styles.timeRow}>
                                <span>{selectedTimes[i]}</span>
                                {selectedTimes[i + 1] && <span>, {selectedTimes[i + 1]}</span>}
                            </div>
                        ) : null
                    )}

                    <div className={styles.roomText}>
                        <strong>{roomName}</strong>
                    </div>
                </div>

                <div className={styles.confirmationSuccess}>예약이 확정되었습니다.</div>
            </div>
        );
    }

    return (
        <>
            <div className={styles.reservationInfo}>
                <div className={styles.dateColumn}>
                    <div className={styles.dateText}>{formattedDate}</div>
                </div>

                <div className={styles.timeColumn}>
                    {selectedTimes.map((time, index) => (
                        <div key={index} className={styles.timeText}>
                            {time}
                        </div>
                    ))}
                </div>

                <div className={styles.roomColumn}>
                    {selectedTimes.map((_, index) => (
                        <div key={index} className={styles.roomText}>
                            {index === 0 ? `${roomName}` : ""}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{width: "100%"}}>
                <div className={styles.inputGroup}>
                    <input
                        className={styles.input}
                        placeholder="학번"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                    />
                    <input
                        className={styles.input}
                        placeholder="전화번호"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <input
                        className={styles.input}
                        placeholder="간편비밀번호 4자리"
                        type="password"
                        maxLength={4}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <p className={styles.errorText}>
                    {showError ? "모든 정보를 입력해주세요." : "\u00A0" }
                </p>

                <div className={styles.buttonSection}>
                    <button className={styles.submitBtn} onClick={handleSubmit}>
                        예약하기
                    </button>
                </div>
            </div>
        </>
    );
};

export default ReservationForm;