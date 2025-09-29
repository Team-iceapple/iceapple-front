import { useEffect, useState } from "react";
import styles from "./Modal.module.css";
import { Icon } from "@iconify/react";
import LoginForm from "./LoginForm";
import ReservationForm from "./ReservationForm";
import ReservationList from "./ReservationList";
import CancelSuccess from "./CancelSuccess";

type ModalStep = "login" | "loginError" | "reservation" | "reservationList" | "CancelSuccess";

interface ModalProps {
    onClose: () => void;
    initialStep?: ModalStep;
    date?: Date;
    selectedTimes?: string[];
    roomName?: string;
    roomId?: string;
    seatsPerSlot?: number;
    minAvailableSeats?: number;
}

const Modal = ({
                   onClose,
                   initialStep = "login",
                   date,
                   selectedTimes,
                   roomName,
                   roomId,
                   seatsPerSlot,
                   minAvailableSeats,
               }: ModalProps) => {
    const [step, setStep] = useState<ModalStep>(initialStep);
    const [studentId, setStudentId] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [cancelledData, setCancelledData] = useState<
        { date: string; times: string[]; room: string }[]
    >([]);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [onClose]);

    return (
        <div className={styles.backdrop} role="dialog" aria-modal="true">
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
                    <Icon icon="mdi:close" style={{ width: "1.6vw", height: "1.6vw" }} />
                </button>

                {(step === "login" || step === "loginError") && (
                    <LoginForm
                        step={step}
                        setStep={setStep}
                        studentId={studentId}
                        setStudentId={setStudentId}
                        setLoginPassword={setLoginPassword}
                    />
                )}

                {step === "reservation" && date && selectedTimes && roomName && roomId && (
                    <ReservationForm
                        date={date}
                        selectedTimes={selectedTimes}
                        roomName={roomName}
                        roomId={roomId}
                        seatsPerSlot={seatsPerSlot ?? 1}
                        minAvailableSeats={minAvailableSeats ?? 0}
                    />
                )}

                {step === "reservationList" && (
                    <ReservationList
                        studentId={studentId}
                        password={loginPassword}
                        setStep={setStep}
                        setCancelledData={setCancelledData}
                    />
                )}

                {step === "CancelSuccess" && (
                    <CancelSuccess
                        studentId={studentId}
                        cancelledReservations={cancelledData}
                        onBackToList={() => setStep("reservationList")}
                        onClose={onClose}
                    />
                )}
            </div>
        </div>
    );
};

export default Modal;
