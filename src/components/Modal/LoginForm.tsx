import { useState } from "react";
import styles from "./Modal.module.css";
import logo from "/logo2.svg";
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

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}place`;

const LoginForm = ({
                       setStep,
                       studentId,
                       setStudentId,
                       setLoginPassword,
                   }: LoginFormProps) => {
    const [password, setPassword] = useState("");
    const [currentInput, setCurrentInput] =
        useState<"studentId" | "password" | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!/^\d{8}$/.test(studentId)) {
            setErrorMsg("학번");
            setStep("loginError");
            return;
        }
        if (!/^\d{4}$/.test(password)) {
            setErrorMsg("비밀번호 4자리");
            setStep("loginError");
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            const { data, status } = await axios.post(
                `${API_BASE_URL}/reservations/reservation-info`,
                { student_number: studentId, password },
                { headers: { "Content-Type": "application/json", Accept: "application/json" } }
            );

            const ok =
                status === 200 &&
                (Array.isArray(data) || data?.authorized === true || data?.success === true);

            if (ok) {
                setLoginPassword(password);
                setStep("reservationList");
            } else {
                setErrorMsg(data?.message || "학번 또는 비밀번호가 올바르지 않습니다.");
                setStep("loginError");
            }
        } catch (e: any) {
            const code = e?.response?.status;
            // 서버에서 보낸 상세 에러 메시지를 변수에 저장
            const serverMessage = e?.response?.data?.message || e?.response?.data?.error || "상세 오류 메시지 없음";

            // 🚨 콘솔에 상세 응답 출력 (가장 중요)
            console.error("400 오류 발생, 서버 응답:", e.response);

            if (code === 401 || code === 404) {
                setErrorMsg("학번 또는 비밀번호가 올바르지 않습니다.");
            } else if (code === 400) {
                // 400인 경우 서버 메시지를 사용하여 구체적인 오류를 표시
                setErrorMsg(`요청 데이터 오류: ${serverMessage}`);
            }
            else setErrorMsg(e?.response?.data?.message || "로그인 중 오류가 발생했습니다.");

            setStep("loginError");
        }
        finally {
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
                    placeholder="  학번 (8자리)"
                    value={studentId}
                    onFocus={() => setCurrentInput("studentId")}
                    readOnly
                />
                <input
                    className={`${styles.input} ${currentInput === "password" ? styles.inputActive : ""}`}
                    placeholder="  간편 비밀번호 4자리"
                    type="password"
                    value={password}
                    onFocus={() => setCurrentInput("password")}
                    readOnly
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
            {currentInput === "password" && (
                <div className={styles.numpadWrap}>
                    <NumberPad
                        value={password}
                        setValue={(v) => setPassword(v.replace(/\D/g, "").slice(0, 4))}
                        maxLength={4}
                    />
                </div>
            )}

            <p className={styles.errorText}>{errorMsg ?? "\u00A0"}</p>

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