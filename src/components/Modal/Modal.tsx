import { useState } from "react";
import styles from "./Modal.module.css";
import { Icon } from "@iconify/react";
import LoginForm from "./LoginForm";
import ReservationForm from "./ReservationModal";
import ReservationManagerModal from "./ReservationManager";

type ModalStep = "login" | "loginError" | "reservation" | "manageReservation";

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

    const renderContent = () => {
        switch (step) {
            case "login":
            case "loginError":
                return (
                    <LoginForm
                        step={step}
                        setStep={setStep}
                        studentId={studentId}
                        setStudentId={setStudentId}
                    />
                );
            case "reservation":
                if (date && selectedTimes && roomName) {
                    return (
                        <ReservationForm
                            date={date}
                            selectedTimes={selectedTimes}
                            roomName={roomName}
                        />
                    );
                }
                return null;
            case "manageReservation":
                return (
                    <ReservationManagerModal
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <Icon icon="mdi:close" style={{ width: "1.6vw", height: "1.6vw" }} />
                </button>

                <div className={styles.modalContent}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default Modal;
