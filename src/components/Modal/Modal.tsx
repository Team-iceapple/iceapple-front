import { useState } from "react";
import styles from "./Modal.module.css";
import { Icon } from "@iconify/react";
import LoginForm from "./LoginForm";

type ModalStep = "login" | "loginError";

const Modal = ({
                   onClose,
                   initialStep = "login",
               }: {
    onClose: () => void;
    initialStep?: ModalStep;
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
                ) : null}
            </div>
        </div>
    );
};

export default Modal;