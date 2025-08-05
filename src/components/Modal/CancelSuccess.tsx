import styles from "./Modal.module.css";

interface CancelSuccessProps {
    studentId: string;
    cancelledReservations: {
        date: string;
        times: string[];
        room: string;
    }[];
}

const CancelSuccess = ({ studentId, cancelledReservations }: CancelSuccessProps) => {
    return (
        <div className={styles.confirmationBox}>
            <div className={styles.confirmationId}>{studentId} 님의</div>

            {cancelledReservations.map((res, idx) => (
                <div key={idx} className={styles.confirmationDetails}>
                    <div>{res.date}</div>
                    <div>{res.times.join(", ")}</div>
                    <div>{res.room}</div>
                </div>
            ))}

            <div className={styles.confirmationSuccess}>예약이 취소되었습니다.</div>
        </div>
    );
};

export default CancelSuccess;