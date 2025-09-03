import { useState } from "react";
import styles from "./Modal.module.css";
import logo from "/logo.svg";
import NumberPad from "../NumberPad/NumberPad.tsx";
import axios from "axios";

type Step = "login" | "loginError" | "reservationList";

interface LoginFormProps {
    step: Step;
    setStep: (s: Step) => void;
    studentId: string;
    setStudentId: (id: string) => void;
    setLoginPassword: (p: string) => void;
}

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}place/api`;

const LoginForm = ({
                       step,
                       setStep,
                       studentId,
                       setStudentId,
                       setLoginPassword,
                   }: LoginFormProps) => {
    const [password, setPassword] = useState("");
    const [currentInput, setCurrentInput] =
        useState<"studentId" | "password" | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!studentId || password.length !== 4) {
            setStep("loginError");
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/reservations/reservation-info`, {
                student_number: studentId,
                password,
            });

            setLoginPassword(password);
            setStep("reservationList");
        } catch (e) {
            console.error(e);
            setStep("loginError");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={styles.content}>
                <img src={logo} alt="로고" className={styles.logo} />
            </div>

            <div className={styles.inputGroup}>
                <input
                    className={`${styles.input} ${currentInput === "studentId" ? styles.inputActive : ""}`}
                    placeholder="학번"
                    value={studentId}
                    onFocus={() => setCurrentInput("studentId")}
                    readOnly
                />
                <input
                    className={`${styles.input} ${currentInput === "password" ? styles.inputActive : ""}`}
                    placeholder="간편 비밀번호 4자리"
                    type="password"
                    value={password}
                    onFocus={() => setCurrentInput("password")}
                    readOnly
                />
            </div>

            {currentInput === "studentId" && (
                <div className={styles.numpadWrap}>
                    <NumberPad value={studentId} setValue={setStudentId} maxLength={10} />
                </div>
            )}
            {currentInput === "password" && (
                <div className={styles.numpadWrap}>
                    <NumberPad
                        value={password}
                        setValue={(v) => setPassword(v.slice(0, 4))}
                    />
                </div>
            )}

            <p className={styles.errorText}>
                {step === "loginError" ? "학번 또는 비밀번호가 올바르지 않습니다." : "\u00A0"}
            </p>

            <div className={styles.buttonSection}>
                <button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "확인 중..." : "예약 내역 조회/취소"}
                </button>
            </div>
        </>
    );
};

export default LoginForm;