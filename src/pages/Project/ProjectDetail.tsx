import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import baseStyles from './Project.module.css';
import detailStyles from './ProjectDetail.module.css';
import { Icon } from '@iconify/react';

type ProjectDetailType = {
    id: string;
    name: string;
    members: string[];
    description: string;
    pdf_url: string;
    year: number;
};

const ProjectDetail = () => {
    const { workid } = useParams<{ workid: string }>();
    const [project, setProject] = useState<ProjectDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!workid) return;
        fetch(`${import.meta.env.VITE_API_BASE_URL}/project/works/${workid}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                // console.log("Detail response:", data);
                setProject(data.work);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [workid]);

    if (loading) return <div className={baseStyles.projectContainer}>로딩 중...</div>;
    if (error) return <div className={baseStyles.projectContainer}>에러: {error}</div>;
    if (!project) return <div className={baseStyles.projectContainer}>존재하지 않는 프로젝트입니다.</div>;

    return (
        <div className={baseStyles.projectContainer}>
            <div className={baseStyles.header}>
                <div className={baseStyles.titleRow}>
                    <Icon icon="lucide:graduation-cap" className={baseStyles.icon} />
                    <h1 className={baseStyles.projectTitle}>졸업작품</h1>
                </div>
            </div>

            <div className={detailStyles.detailCard}>
                <div className={detailStyles.detailHeader}>
                    <h1 className={detailStyles.projectName}>{project.name}</h1>
                    <p className={detailStyles.detailAuthors}>{project.members.join(', ')}</p>
                </div>
                <hr className={detailStyles.detailDivider} />
                <p className={detailStyles.detailDescription}>{project.description}</p>
                <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/project/files/${project.pdf_url}`}
                    alt="프로젝트 이미지"
                    className={detailStyles.detailImage}
                />
            </div>
        </div>
    );
};

export default ProjectDetail;
