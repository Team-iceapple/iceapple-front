import styles from "./Modal.module.css";

type CancelledItem = {
    date: string;
    times: string[];
    room: string;
};

interface CancelSuccessProps {
    studentId: string;
    cancelledReservations: CancelledItem[];
    onBackToList?: () => void;
    onClose?: () => void;
}

const toKoreanDate = (isoOrYmd: string) => {
    const d = isoOrYmd.includes("T") ? new Date(isoOrYmd) : new Date(`${isoOrYmd}T00:00:00`);
    return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
};

const CancelSuccess = ({
                           studentId,
                           cancelledReservations,
                       }: CancelSuccessProps) => {
    const hasItems = cancelledReservations && cancelledReservations.length > 0;

    return (
        <div className={styles.confirmationBox}>
            <div className={styles.confirmationId}>{studentId} 님의</div>

            <div className={styles.cancelList}>
                {hasItems ? (
                    cancelledReservations.map((res, idx) => (
                        <div key={idx} className={styles.confirmationDetails}>
                            <div>{toKoreanDate(res.date)}</div>
                            <div>{res.times.join(", ")}</div>
                            <div>{res.room}</div>
                        </div>
                    ))
                ) : (
                    <div className={styles.confirmationDetails}>취소된 예약이 없습니다.</div>
                )}
            </div>

            <div className={styles.confirmationSuccess}>예약이 취소되었습니다.</div>
        </div>
    );
};

export default CancelSuccess;