import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import baseStyles from './Project.module.css';
import detailStyles from './ProjectDetail.module.css';
import { QRCodeSVG } from 'qrcode.react';

type MemberType = {
    name: string;
    extra: string;
};

type ProjectDetailType = {
    id: string;
    name: string;
    team_name: string;
    members: MemberType[];
    description: string;
    pdf_url: string;
    main_url: string;
    year: number;
};

const ProjectDetail = () => {
    const { workid } = useParams<{ workid: string }>();
    const [project, setProject] = useState<ProjectDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!workid) return;

        fetch(`${import.meta.env.VITE_API_BASE_URL}project/works/${workid}`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => setProject(data.work))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [workid]);

    useEffect(() => {
        if (!project?.pdf_url) return;

        const fileUrl = `${import.meta.env.VITE_API_BASE_URL}project/files/${project.pdf_url}`;
        fetch(fileUrl, {
            headers: {
                Accept: "application/pdf"
            }
        })
            .then(res => res.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                setPdfBlobUrl(url);
            })
            .catch(err => {
                console.error("PDF fetch 실패:", err);
            });
    }, [project?.pdf_url]);

    if (loading) return <div className={baseStyles.projectContainer}>로딩 중...</div>;
    if (error) return <div className={baseStyles.projectContainer}>에러: {error}</div>;
    if (!project) return <div className={baseStyles.projectContainer}>존재하지 않는 프로젝트입니다.</div>;

    return (
        <div className={baseStyles.container}>
            <div className={detailStyles.detailLayout}>

                <div className={detailStyles.detailTextBox}>
                    <h1 className={detailStyles.projectName}>{project.name}</h1>
                    <p className={detailStyles.teamName}>팀명: {project.team_name}</p>
                    <hr className={detailStyles.detailDivider} />
                    <p className={detailStyles.detailDescription}>{project.description}</p>

                    <div className={detailStyles.memberBlock}>
                        <strong>팀 정보</strong>
                        <ul>
                            {project.members.map((m, i) => (
                                <li key={i}>
                                    {m.name} {m.extra && `(${m.extra})`}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={detailStyles.qrBox}>
                        <QRCodeSVG value={project.main_url} style={{ width: '7vw', height: '7vw' }} />
                    </div>
                </div>

                <div className={detailStyles.detailImageBox}>
                    {pdfBlobUrl ? (
                        <iframe
                            src={pdfBlobUrl}
                            title="PDF 미리보기"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                    ) : (
                        <p>PDF를 불러오는 중입니다...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
