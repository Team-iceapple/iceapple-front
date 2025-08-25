import { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '/logo.svg';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const [openSheet, setOpenSheet] = useState(false);
    const [anim, setAnim] = useState(false);
    const navigate = useNavigate();
    const sheetRef = useRef(null);

    const openModal = useCallback((e) => {
        e.preventDefault();
        setOpenSheet(true);
        requestAnimationFrame(() => setAnim(true));
    }, []);

    const closeModal = useCallback(() => {
        setAnim(false);
        setTimeout(() => setOpenSheet(false), 180);
    }, []);

    const safeNav = (path) => {
        if (!path) return;
        closeModal();
        navigate(path, { replace: false });
    };

    return (
        <aside className={styles.sidebar}>
            <img src={logo} alt="로고" className={styles.logo} />
            <h2 className={styles.title}>모바일융합공학과</h2>
            <div className={styles.divider}></div>

            <nav className={styles.nav}>
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ''}`
                    }
                >
                    <Icon icon="lucide:home" className={styles.icon} />
                    홈
                </NavLink>

                <NavLink
                    to="/notice"
                    onClick={openModal}
                    className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ''}`
                    }
                >
                    <Icon icon="lucide:megaphone" className={styles.icon} />
                    공지사항
                </NavLink>

                <NavLink
                    to="/rooms"
                    className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ''}`
                    }
                >
                    <Icon icon="lucide:calendar" className={styles.icon} />
                    회의실 예약
                </NavLink>

                <NavLink
                    to="/works"
                    className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ''}`
                    }
                >
                    <Icon icon="lucide:graduation-cap" className={styles.icon} />
                    프로젝트
                </NavLink>
            </nav>

            {openSheet && (
                <div
                    className={`${styles.sheetBackdrop} ${anim ? styles.show : ''}`}
                    onClick={closeModal}
                    role="presentation"
                >
                    <div
                        ref={sheetRef}
                        className={`${styles.sheet} ${anim ? styles.slideUp : ''}`}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="noticeSheetTitle"
                    >
                        <div className={styles.sheetHandle} aria-hidden="true" />
                        <h3 id="noticeSheetTitle" className={styles.sheetTitle}>
                            공지사항 선택
                        </h3>

                        <div className={styles.sheetButtons}>
                            <button
                                type="button"
                                className={styles.kioskBtn}
                                onClick={() => safeNav('/notice')}
                            >
                                학과 공지사항<br /><span className={styles.sub}>Notice</span>
                            </button>

                            <button
                                type="button"
                                className={styles.kioskBtn}
                                onClick={() => safeNav('/sojoong')}
                            >
                                소프트웨어중심사업단<br /><span className={styles.sub}>sojoong</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            className={styles.kioskCancel}
                            onClick={closeModal}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
