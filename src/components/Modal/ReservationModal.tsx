import styles from "./Modal.module.css";

const ReservationForm = ({
                             date,
                             selectedTimes,
                             roomName,
                         }: {
    date: Date;
    selectedTimes: string[];
    roomName: string;
}) => {
    const formattedDate = new Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
    }).format(date);

    return (
        <>
            <div style={{ marginBottom: "1vw", fontWeight: 700 }}>
                {formattedDate}{" "}
                <span style={{ fontWeight: 400 }}>
          {selectedTimes.join(", ")} | {roomName}
        </span>
            </div>

            <div className={styles.inputGroup}>
                <input className={styles.input} placeholder="학번" />
                <input className={styles.input} placeholder="전화번호" />
                <input
                    className={styles.input}
                    placeholder="간편비밀번호 4자리"
                    type="password"
                />
            </div>

            <div className={styles.buttonSection}>
                <button className={styles.submitBtn}>예약하기</button>
            </div>
        </>
    );
};

export default ReservationForm;
