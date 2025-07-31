import { useState } from "react";
import styles from "./Modal.module.css";
import { Icon } from "@iconify/react";
import LoginForm from "./LoginForm";
import ReservationForm from "./ReservationModal";

type ModalStep = "login" | "loginError" | "reservation";

const Modal = ({
                   onClose,
                   initialStep = "login",
                   date,
                   selectedTimes,
                   roomName,
               }: {
    onClose: () => void;
    initialStep?: ModalStep;
    date?: Date;
    selectedTimes?: string[];
    roomName?: string;
}) => {

    const [step, setStep] = useState<ModalStep>(initialStep);
    const [studentId, setStudentId] = useState("");

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <Icon icon="mdi:close" style={{ width: "1.6vw", height: "1.6vw" }} />
                </button>

                {step === "login" || step === "loginError" ? (
                    <LoginForm
                        step={step}
                        setStep={setStep}
                        studentId={studentId}
                        setStudentId={setStudentId}
                    />
                ) : step === "reservation" && date && selectedTimes && roomName ? (
                    <ReservationForm
                        date={date}
                        selectedTimes={selectedTimes}
                        roomName={roomName}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default Modal;