import { useParams } from 'react-router-dom';
import baseStyles from './Project.module.css';
import detailStyles from './ProjectDetail.module.css';
import { Icon } from '@iconify/react';

const projectData: Record<string, {
    title: string;
    authors: string;
    description: string;
    image: string;
}> = {
    "1": {
        title: "실시간 협업 캔버스 히스토리 및 복원 시스템",
        authors: "신보연, 이혜현, 임예은",
        description: `여러 사용자가 실시간으로 동시에 피피티를 편집할 수 있으며,
슬라이드 별 히스토리 기능을 통해 이전 버전으로 되돌리는 기능을 제공합니다.`,
        image: "/assets/project1.png",
    }
};

const ProjectDetail = () => {
    const { workid } = useParams();
    const project = projectData[workid || ""];

    if (!project) {
        return <div className={baseStyles.projectContainer}>존재하지 않는 프로젝트입니다.</div>;
    }

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
                    <h1 className={detailStyles.projectName}>{project.title}</h1>
                    <p className={detailStyles.detailAuthors}>{project.authors}</p>
                </div>
                <hr className={detailStyles.detailDivider} />
                <p className={detailStyles.detailDescription}>{project.description}</p>
                <img
                    src={project.image}
                    alt="프로젝트 대표 이미지"
                    className={detailStyles.detailImage}
                />
            </div>
        </div>
    );
};

export default ProjectDetail;
