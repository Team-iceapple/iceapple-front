import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '/logo.svg';
import styles from './Sidebar.module.css';

const Sidebar = () => {
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
                    className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ''}`
                    }
                >
                    <Icon icon="lucide:megaphone" className={styles.icon} />
                    공지사항
                </NavLink>
                <NavLink
                    to="/room"
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
        </aside>
    );
};

export default Sidebar;
