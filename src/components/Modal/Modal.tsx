import { useState } from "react";
import styles from "./Modal.module.css";
import { Icon } from "@iconify/react";
import LoginForm from "./LoginForm";
import ReservationForm from "./ReservationForm.tsx";
import ReservationList from "./ReservationList.tsx";
import ReservationManagerModal from "./ReservationManager";
import CancelSuccess from "./CancelSuccess";

type ModalStep = "login" | "loginError" | "reservation" | "manageReservation" | "reservationList" | "CancelSuccess";

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
    const [cancelledData, setCancelledData] = useState<
        { date: string; times: string[]; room: string }[]
    >([]);

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <Icon icon="mdi:close" style={{ width: "1.6vw", height: "1.6vw" }} />
                </button>

                <div className={styles.modalContent}>
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
                    ) : step === "manageReservation" ? (
                        <ReservationManagerModal />
                    ) : step === "reservationList" ? (
                        <ReservationList
                            studentId={studentId}
                            setStep={setStep}
                            setCancelledData={setCancelledData}
                        />
                    ) : step === "CancelSuccess" ? (
                        <CancelSuccess studentId={studentId} cancelledReservations={cancelledData} />
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Modal;
