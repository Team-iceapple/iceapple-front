import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '/logo.svg';
import styles from './Sidebar.module.css';
import { isReservationEnabled } from '../../utils/reservationFlag';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [openNotice, setOpenNotice] = useState(false);
    const groupRef = useRef(null);
    const navRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onClickOutside = () => {
            if (!groupRef.current) return;
            // if (!groupRef.current.contains(e.target)) {
            //     setOpenNotice(false);
            // }
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setOpenNotice(false);
        };
        document.addEventListener('click', onClickOutside);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('click', onClickOutside);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    useEffect(() => {
        const isNoticePath =
            location.pathname.startsWith('/notice') ||
            location.pathname.startsWith('/sojoong');
        setOpenNotice(isNoticePath);
    }, [location.pathname]);

    const safeNav = useCallback(
        (path) => {
            if (!path) return;
            navigate(path, { replace: false });
        },
        [navigate]
    );

    return (
        <aside className={styles.sidebar}>
            <img src={logo} alt="로고" className={styles.logo} />
            <h2 className={styles.title}>모바일융합공학과</h2>
            <div className={styles.divider} />

            <nav className={styles.nav} ref={navRef}>
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ''}`
                    }
                >
                    <Icon icon="lucide:home" className={styles.icon} />
                    홈
                </NavLink>

                <div className={styles.group} ref={groupRef}>
                    <button
                        type="button"
                        className={`${styles.link} ${
                            location.pathname.startsWith('/notice') ||
                            location.pathname.startsWith('/sojoong')
                                ? styles.activeSoft
                                : ''
                        }`}
                        aria-expanded={openNotice}
                        aria-controls="notice-submenu"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenNotice((v) => !v);
                        }}
                    >
                        <Icon icon="lucide:megaphone" className={styles.icon} />
                        공지사항
                        <Icon
                            icon="lucide:chevron-down"
                            className={`${styles.caret} ${openNotice ? styles.caretOpen : ''}`}
                        />
                    </button>

                    <div
                        id="notice-submenu"
                        role="menu"
                        aria-label="공지사항 하위 메뉴"
                        className={`${styles.submenuWrap} ${
                            openNotice ? styles.submenuOpen : ''
                        }`}
                    >
                        <NavLink
                            to="/notice"
                            role="menuitem"
                            className={({ isActive }) =>
                                `${styles.sublink} ${isActive ? styles.subActive : ''}`
                            }
                            onClick={(e) => {
                                e.preventDefault();
                                safeNav('/notice');
                            }}
                        >
                            <span className={styles.bullet} />
                            모바일융합공학과
                        </NavLink>

                        <NavLink
                            to="/sojoong"
                            role="menuitem"
                            className={({ isActive }) =>
                                `${styles.sublink} ${isActive ? styles.subActive : ''}`
                            }
                            onClick={(e) => {
                                e.preventDefault();
                                safeNav('/sojoong');
                            }}
                        >
                            <span className={styles.bullet} />
                            SW중심대학사업단
                        </NavLink>
                    </div>
                </div>

                {isReservationEnabled() ? (
                    <NavLink
                        to="/rooms"
                        className={({ isActive }) =>
                            `${styles.link} ${isActive ? styles.active : ''}`
                        }
                    >
                        <Icon icon="lucide:calendar" className={styles.icon} />
                        회의실 예약
                    </NavLink>
                ) : (
                    <button
                        type="button"
                        className={styles.link}
                        disabled
                        aria-disabled="true"
                        title="특수 링크로 접근해야 활성화됩니다 (?reserve=on)"
                        style={{ cursor: 'not-allowed', opacity: 0.6 }}
                    >
                        <Icon icon="lucide:calendar" className={styles.icon} />
                        회의실 예약
                    </button>
                )}

                <NavLink
                    to="/works"
                    className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ''}`
                    }
                >
                    <Icon icon="lucide:graduation-cap" className={`${styles.icon} ${styles.bigIcon}`} />
                    졸업작품
                </NavLink>

				<NavLink
					to="/dashboard/link1"
					className={({ isActive }) =>
						`${styles.link} ${isActive ? styles.active : ''}`
					}
					onClick={(e) => {
						e.preventDefault();
						safeNav('/dashboard/link1');
					}}
				>
					<Icon icon="lucide:layout-dashboard" className={styles.icon} />
					강의실 IAQ
				</NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;
