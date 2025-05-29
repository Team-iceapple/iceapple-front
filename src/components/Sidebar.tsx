import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import homeIcon from '@iconify/icons-mdi/home';
import megaphoneIcon from '@iconify/icons-mdi/megaphone';
import calendarIcon from '@iconify/icons-mdi/calendar';
import graduationCap from '@iconify/icons-mdi/school';
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
                    <Icon icon={homeIcon} width="20" height="20" />
                    홈
                </NavLink>
                <NavLink
                    to="/notice"
                    className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ''}`
                    }
                >
                    <Icon icon={megaphoneIcon} width="20" height="20" />
                    공지사항
                </NavLink>
                <NavLink
                    to="/reserve"
                    className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ''}`
                    }
                >
                    <Icon icon={calendarIcon} width="20" height="20" />
                    회의실 예약
                </NavLink>
                <NavLink
                    to="/project"
                    className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ''}`
                    }
                >
                    <Icon icon={graduationCap} width="20" height="20" />
                    졸업작품
                </NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;
