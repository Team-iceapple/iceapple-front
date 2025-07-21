import {useState} from "react";
import styles from "./Modal.module.css";
import logo from '/logo.svg';

const LoginForm = ({
                       step,
                       setStep,
                       studentId,
                       setStudentId,
                   }: {
    step: "login" | "loginError";
    setStep: (s: "login" | "loginError") => void;
    studentId: string;
    setStudentId: (id: string) => void;
}) => {
    const [password, setPassword] = useState("");

    const handleSubmit = () => {
        if (studentId === "20221037" && password === "0000") {
            alert("로그인 성공!");
        } else {
            setStep("loginError");
        }
    };

    return (
        <>
            <div className={styles.content}>
                <img src={logo} alt="로고" className={styles.logo}/>
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
                {step === "loginError" && (
                    <p className={styles.errorText}>비밀번호가 잘못되었습니다.</p>
                )}
            </div>

            <div className={styles.buttonSection}>
                <button className={styles.submitBtn} onClick={handleSubmit}>
                    예약 내역 조회/취소
                </button>
            </div>
        </>
    );
};

export default LoginForm;