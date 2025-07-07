import baseStyles from "../Project/Project.module.css";
import styles from "../Project/Project.module.css";
import {Icon} from "@iconify/react";

const Room = () => {
    return (
        <div className={baseStyles.projectContainer}>
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <Icon icon="lucide:calendar" className={styles.icon} />
                    <h1 className={styles.projectTitle}>공간 예약</h1>
                </div>
            </div>
        </div>
    )
}

export default Room;