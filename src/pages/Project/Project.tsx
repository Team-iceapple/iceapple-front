import styles from "./Project.module.css";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

// id를 포함한 프로젝트 목록 생성
const projects = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: "실시간 협업 캔버스 히스토리 및 복원 시스템",
    authors: "신보연, 이혜현, 임예은",
}));

const Project = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.projectContainer}>
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <Icon icon="lucide:graduation-cap" className={styles.icon} />
                    <h1 className={styles.projectTitle}>졸업작품</h1>
                </div>
                <h2 className={styles.projectSubtitle}>2026 졸업</h2>
            </div>

            <div className={styles.projectGrid}>
                {projects.map((p) => (
                    <div
                        className={styles.projectCard}
                        key={p.id}
                        onClick={() => navigate(`/works/${p.id}`)}
                        style={{ cursor: "pointer" }}
                    >
                        <div className={styles.projectImagePlaceholder} />
                        <div className={styles.projectInfo}>
                            <p className={styles.projectName}>{p.title}</p>
                            <p className={styles.projectAuthors}>{p.authors}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Project;
