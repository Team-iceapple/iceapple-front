import React, { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

const LINK1 = (import.meta).env?.VITE_DASHBOARD_LINK1;
const LINK2 = (import.meta).env?.VITE_DASHBOARD_LINK2;

const Dashboard: React.FC = () => {
    const params = useParams();
    const slug = (params?.slug || '').toLowerCase();

    const src = useMemo(() => {
        if (slug === 'link1') return LINK1;
        if (slug === 'link2') return LINK2;
        return null;
    }, [slug]);

    if (!src) {
        return <Navigate to="/dashboard/link1" replace />;
    }

    return (
        <div className={styles.container}>
            <iframe
                title="dashboard"
                src={src}
                className={styles.frame}
                allow="fullscreen"
                referrerPolicy="no-referrer-when-downgrade"
            />
        </div>
    );
};

export default Dashboard;


