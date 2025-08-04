import { useState } from "react";
import styles from "./Modal.module.css";
import logo from '/logo.svg';

type Reservation = {
    id: string;
    date: string;
    time: string;
};

type Step = "input" | "result" | "cancelled";

const ReservationManagerModal = () => {
    const [step, setStep] = useState<Step>("input");
    const [studentId, setStudentId] = useState("");
    const [password, setPassword] = useState("");
    const [reservations, setReservations] = useState<Reservation[] | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [cancelMessage, setCancelMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleLookup = () => {
        if (password !== "1234") {
            setErrorMessage("비밀번호가 잘못되었습니다.");
            return;
        }

        const mockReservations: Reservation[] = [
            { id: "r1", date: "8월 10일 (토)", time: "10:00 ~ 11:00" },
            { id: "r2", date: "8월 11일 (일)", time: "11:00 ~ 12:00" },
        ];
        setReservations(mockReservations);
        setCancelMessage("");
        setErrorMessage("");
        setStep("result");
    };

    const handleCancel = () => {
        if (selectedId && reservations) {
            const selected = reservations.find(r => r.id === selectedId);
            if (selected) {
                setReservations(prev => prev?.filter(r => r.id !== selectedId) || []);
                setCancelMessage(`${studentId} 님의 ${selected.date} ${selected.time} 예약이 취소되었습니다.`);
                setSelectedId(null);
                setStep("cancelled");
            }
        }
    };

    return (
        <div>
            {step === "input" && (
                <>
                    <div className={styles.content}>
                        <img src={logo} alt="로고" className={styles.logo} />
                        <div className={styles.inputGroup}>
                            <input
                                className={styles.input}
                                placeholder="학번"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                            />
                            <input
                                className={styles.input}
                                placeholder="간편 비밀번호 4자리"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {errorMessage && (
                            <p className={styles.errorText}>{errorMessage}</p>
                        )}
                    </div>

                    <div className={styles.buttonSection}>
                        <button className={styles.submitBtn} onClick={handleLookup}>
                            예약 내역 조회/취소
                        </button>
                    </div>
                </>
            )}

            {step === "result" && reservations && (
                <div style={{ marginTop: "1vw" }}>
                    {reservations.map((r) => (
                        <label
                            key={r.id}
                            style={{
                                display: "block",
                                margin: "1vw 0",
                                padding: "0.5vw",
                                border: "1px solid #ddd",
                                borderRadius: "0.5vw",
                                cursor: "pointer",
                            }}
                        >
                            <input
                                type="radio"
                                name="reservation"
                                value={r.id}
                                checked={selectedId === r.id}
                                onChange={() => setSelectedId(r.id)}
                                style={{ marginRight: "0.5vw" }}
                            />
                            <span style={{ fontSize: "1.1vw", fontWeight: "bold" }}>{r.date}</span>
                            <br />
                            <span style={{ fontSize: "0.9vw" }}>{r.time}</span>
                        </label>
                    ))}

                    <div className={styles.buttonSection}>
                        <button className={styles.submitBtn} onClick={handleCancel}>
                            선택 예약 취소
                        </button>
                    </div>
                </div>
            )}

            {step === "cancelled" && (
                <div style={{ marginTop: "1vw", textAlign: "center" }}>
                    <div style={{ fontWeight: 500, color: "green", marginBottom: "1vw" }}>
                        {cancelMessage}
                    </div>
                    <button className={styles.submitBtn} onClick={() => setStep("input")}>
                        처음으로 돌아가기
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReservationManagerModal;
