import React, { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar.tsx';
import styles from './Layout.module.css';
import { Footer } from '../Footer/Footer.tsx';

interface LayoutProps {
    children: React.ReactNode;
}

const IDLE_TIMEOUT = 180000;

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const timeoutRef = useRef<number | null>(null);

    const resetTimer = useCallback(() => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }

        if (location.pathname !== '/') {
            timeoutRef.current = window.setTimeout(() => {
                navigate('/');
            }, IDLE_TIMEOUT);
        } else {
            timeoutRef.current = null;
        }
    }, [navigate, location.pathname]);

    useEffect(() => {
        resetTimer();

        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [resetTimer]);

    useEffect(() => {
        if (location.pathname === '/') {
            return;
        }

        const events = ['mousemove', 'keydown', 'click', 'scroll'];

        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [location.pathname, resetTimer]);

    return (
        <div className={styles.layout}>
            <div className={styles.container}>
                <main className={styles.main}>{children}</main>
                <Sidebar />
            </div>
            <div className={styles.footerWrapper}>
                <Footer />
            </div>
        </div>
    );
};

export default Layout;