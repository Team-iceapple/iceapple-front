import { useState, useEffect } from 'react';
import styles from './Project.module.css';
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

type MemberType = {
    name: string;
    extra: string;
};

type ProjectType = {
    id: string;
    name: string;
    members: MemberType[];
    thumbnail: string;
    year: number;
};

const Project = () => {
    const [projects, setProjects] = useState<ProjectType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(2026);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}project/works`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                setProjects(data.works);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const filteredProjects = projects.filter(p => p.year === selectedYear);

    if (loading) return <div className={styles.projectContainer}>로딩 중...</div>;
    if (error) return <div className={styles.projectContainer}>에러: {error}</div>;

    return (
        <div className={styles.projectContainer}>
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <Icon icon="lucide:graduation-cap" className={styles.icon} />
                    <h1 className={styles.projectTitle}>졸업작품</h1>
                </div>
                <div className={styles.yearDropdownWrapper}>
                    <div
                        className={styles.yearDropdownToggle}
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        {selectedYear} <Icon icon="mdi:chevron-down" />
                    </div>
                    {dropdownOpen && (
                        <ul className={styles.yearDropdownMenu}>
                            {[2026, 2027].map(year => (
                                <li
                                    key={year}
                                    onClick={() => {
                                        setSelectedYear(year);
                                        setDropdownOpen(false);
                                    }}
                                >
                                    {year}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className={styles.projectGrid}>
                {filteredProjects.map(p => (
                    <div
                        key={p.id}
                        className={styles.projectCard}
                        onClick={() => navigate(`/works/${p.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className={styles.projectImagePlaceholder}>
                            <img
                                src={`${import.meta.env.VITE_API_BASE_URL}project/files/${p.thumbnail}`}
                                alt={p.name}
                                className={styles.projectImage}
                            />
                        </div>
                        <div className={styles.projectInfo}>
                            <p className={styles.projectName}>{p.name}</p>
                            <p className={styles.projectAuthors}>
                                {p.members.map(m => m.name).join(', ')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Project;
