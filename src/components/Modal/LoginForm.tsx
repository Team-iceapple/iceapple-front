import { useState } from "react";
import styles from "./Modal.module.css";
import logo from "/logo.svg";

const LoginForm = ({
                       step,
                       setStep,
                       studentId,
                       setStudentId,
                   }: {
    step: "login" | "loginError";
    setStep: (s: "login" | "loginError" | "reservationList") => void;
    studentId: string;
    setStudentId: (id: string) => void;
}) => {
    const [password, setPassword] = useState("");

    const handleSubmit = () => {
        if (studentId === "20221037" && password === "0000") {
            setStep("reservationList");
        } else {
            setStep("loginError");
        }
    };

    return (
        <>
            <div className={styles.content}>
                <img src={logo} alt="로고" className={styles.logo} />
            </div>

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

            <p className={styles.errorText}>
                {step === "loginError" ? "학번 또는 비밀번호가 올바르지 않습니다." : "\u00A0"}
            </p>

            <div className={styles.buttonSection}>
                <button className={styles.submitBtn} onClick={handleSubmit}>
                    예약 내역 조회/취소
                </button>
            </div>
        </>
    );
};

export default LoginForm;