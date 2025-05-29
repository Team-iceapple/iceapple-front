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
                    <Icon icon="lucide:home" width="20" height="20" />
                    홈
                </NavLink>
                <NavLink
                    to="/notice"
                    className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ''}`
                    }
                >
                    <Icon icon="lucide:megaphone" width="20" height="20" />
                    공지사항
                </NavLink>
                <NavLink
                    to="/reserve"
                    className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ''}`
                    }
                >
                    <Icon icon="lucide:calendar" width="20" height="20" />
                    회의실 예약
                </NavLink>
                <NavLink
                    to="/project"
                    className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ''}`
                    }
                >
                    <Icon icon="lucide:graduation-cap" width="20" height="20" />
                    졸업작품
                </NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;
