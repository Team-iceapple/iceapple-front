import { useState, useEffect } from 'react';
import styles from './Project.module.css';
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

type ProjectType = {
    id: string;
    name: string;
    members: string[];
    thumbnail: string;
    year: number;
};

const Project = () => {
    const [projects, setProjects] = useState<ProjectType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/project/works`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                console.log("API 응답 데이터:", data);
                setProjects(data.works);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className={styles.projectContainer}>로딩 중...</div>;
    if (error) return <div className={styles.projectContainer}>에러: {error}</div>;

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
                {projects.map(p => (
                    <div
                        key={p.id}
                        className={styles.projectCard}
                        onClick={() => navigate(`/works/${p.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className={styles.projectImagePlaceholder}>
                            {/* 썸네일 이미지 예시 */}
                            {/* <img src={p.thumbnail} alt={p.name} /> */}
                        </div>
                        <div className={styles.projectInfo}>
                            <p className={styles.projectName}>{p.name}</p>
                            <p className={styles.projectAuthors}>{p.members.join(', ')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Project;
