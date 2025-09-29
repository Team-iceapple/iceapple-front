import { useMemo, useState } from "react";
import styles from "./Modal.module.css";
import NumberPad from "../NumberPad/NumberPad.tsx";
import axios, { AxiosError } from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}place`;

type Props = {
    date: Date;
    selectedTimes: string[];
    roomName: string;
    roomId: string;
    seatsPerSlot: number;
    minAvailableSeats: number;
};

const toYMD = (d: Date) => {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}T00:00:00`;
};

const timeToHour = (t: string) => parseInt(t.slice(0, 2), 10);

const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 11) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return raw;
};

const ReservationForm = ({ date, selectedTimes, roomName, roomId, seatsPerSlot, minAvailableSeats }: Props) => {
    const [studentId, setStudentId] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [seatCount, setSeatCount] = useState("1");

    const maxSelectableSeats = Math.min(seatsPerSlot, minAvailableSeats);
    const finalMaxSeats = Math.max(0, maxSelectableSeats);


    const [currentInput, setCurrentInput] =
        useState<"studentId" | "phone" | "password" | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [showError, setShowError] = useState<string | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const sortedSelectedTimes = useMemo(() => {
        const unique = Array.from(new Set(selectedTimes));
        return unique.sort((a, b) => timeToHour(a) - timeToHour(b));
    }, [selectedTimes]);

    const formattedDate = useMemo(
        () =>
            new Intl.DateTimeFormat("ko-KR", {
                month: "long",
                day: "numeric",
                weekday: "short",
            }).format(date),
        [date]
    );

    const seatCountNum = parseInt(seatCount, 10);

    const handleSeatCountChange = (delta: 1 | -1) => {
        const currentCount = parseInt(seatCount, 10);
        const newCount = currentCount + delta;

        if (newCount >= 1 && newCount <= finalMaxSeats) {
            setSeatCount(String(newCount));
        }
    };

    const handleSubmit = async () => {
        if (!/^\d{8}$/.test(studentId)) {
            setShowError("학번을 올바르게 입력해주세요.");
            return;
        }
        if (!/^\d{11}$/.test(phone)) {
            setShowError("전화번호 11자리를 숫자로 입력해주세요.");
            return;
        }
        if (!/^\d{4}$/.test(password)) {
            setShowError("간편비밀번호 4자리를 입력해주세요.");
            return;
        }
        if (selectedTimes.length === 0) {
            setShowError("시간을 선택해주세요.");
            return;
        }

        if (seatCountNum <= 0 || seatCountNum > finalMaxSeats) {
            setShowError(`예약 좌석은 1개부터 최대 ${finalMaxSeats}개(잔여 좌석)까지 가능합니다.`);
            return;
        }

        const times = Array.from(new Set(selectedTimes.map(timeToHour))).sort(
            (a, b) => a - b
        );

        const payload = {
            student_number: studentId,
            phone_number: formatPhone(phone),
            password,
            place_id: roomId,
            date: toYMD(date),
            times,
            seat_count: seatCountNum,
        };

        setShowError(null);
        setSubmitting(true);
        try {
            await axios.post(`${API_BASE_URL}/reservations`, payload, {
                headers: { "Content-Type": "application/json", Accept: "application/json" },
            });
            setIsConfirmed(true);
        } catch (err) {
            const axiosErr = err as AxiosError<{ message?: string }>;
            const msg =
                axiosErr.response?.data?.message ||
                "예약에 실패했습니다. 입력 정보를 다시 확인해주세요.";
            setShowError(msg);
            console.error("예약 실패", payload, axiosErr);
        } finally {
            setSubmitting(false);
        }
    };

    if (isConfirmed) {
        return (
            <div className={styles.confirmationBox}>
                <div className={styles.confirmationId}>{studentId} 님의</div>

                <div className={styles.confirmationDetails}>
                    <strong>{formattedDate}</strong>

                    {sortedSelectedTimes.map((time, i) => (
                        <div key={i} className={styles.timeRow}>
                            {time}
                        </div>
                    ))}

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
                    {sortedSelectedTimes.map((time, index) => (
                        <div key={index} className={styles.timeText}>
                            {time}
                        </div>
                    ))}
                </div>

                <div className={styles.roomColumn}>
                    {sortedSelectedTimes.map((_, index) => (
                        <div key={index} className={styles.roomText}>
                            {index === 0 ? roomName : ""}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ width: "100%" }}>
                <div className={styles.inputGroup}>
                    <div className={styles.seatCountStepper}>
                        <label> 예약 좌석 수 </label>
                        <div className={styles.stepperControl}>
                            <button
                                type="button"
                                onClick={() => handleSeatCountChange(-1)}
                                disabled={seatCountNum <= 1}
                            >
                                -
                            </button>
                            <span>{seatCountNum}</span>
                            <button
                                type="button"
                                onClick={() => handleSeatCountChange(1)}
                                // 💡 수정: finalMaxSeats로 증가를 제한합니다.
                                disabled={seatCountNum >= finalMaxSeats}
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <input
                        className={`${styles.input} ${
                            currentInput === "studentId" ? styles.inputActive : ""
                        }`}
                        placeholder="  학번 (8자리)"
                        value={studentId}
                        readOnly
                        onFocus={() => setCurrentInput("studentId")}
                    />
                    <input
                        className={`${styles.input} ${
                            currentInput === "phone" ? styles.inputActive : ""
                        }`}
                        placeholder="  전화번호 (하이픈 없이 11자리)"
                        value={phone}
                        readOnly
                        onFocus={() => setCurrentInput("phone")}
                    />
                    <input
                        className={`${styles.input} ${
                            currentInput === "password" ? styles.inputActive : ""
                        }`}
                        placeholder="  간편비밀번호 4자리"
                        type="password"
                        value={password}
                        readOnly
                        onFocus={() => setCurrentInput("password")}
                    />
                </div>

                {currentInput === "studentId" && (
                    <div className={styles.numpadWrap}>
                        <NumberPad
                            value={studentId}
                            setValue={(v) => setStudentId(v.replace(/\D/g, "").slice(0, 8))}
                            maxLength={8}
                        />
                    </div>
                )}
                {currentInput === "phone" && (
                    <div className={styles.numpadWrap}>
                        <NumberPad
                            value={phone}
                            setValue={(v) => setPhone(v.replace(/\D/g, "").slice(0, 11))}
                            maxLength={11}
                            variant="phone"
                        />
                    </div>
                )}
                {currentInput === "password" && (
                    <div className={styles.numpadWrap}>
                        <NumberPad
                            value={password}
                            setValue={(v) => setPassword(v.replace(/\D/g, "").slice(0, 4))}
                            maxLength={4}
                        />
                    </div>
                )}

                <p className={styles.errorText}>{showError ?? "\u00A0"}</p>

                <div className={styles.buttonSection}>
                    <button
                        className={styles.submitBtn}
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? "처리 중..." : "예약하기"}
                    </button>
                </div>
            </div>
        </>
    );
};

export default ReservationForm;
