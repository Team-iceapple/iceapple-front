import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import baseStyles from './Project.module.css';
import detailStyles from './ProjectDetail.module.css';
import { QRCodeSVG } from 'qrcode.react';
import { Icon } from "@iconify/react";
import PdfViewer from "../../components/PdfViewer/PdfViewer";

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
    const navigate = useNavigate();
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
        <div className={detailStyles.container}>
            <button
                className={detailStyles.backButton}
                onClick={() => navigate('/works')}
                aria-label="뒤로가기"
            >
                <Icon icon="mingcute:arrow-left-fill" width="2vw" height="2vw" />

            </button>

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

                <div className={detailStyles.detailImageBox} style={{ position: 'relative' }}>
                    {pdfBlobUrl ? (
                        <PdfViewer url={pdfBlobUrl} />
                    ) : (
                        <p>PDF를 불러오는 중입니다...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
