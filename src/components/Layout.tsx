import React from 'react';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className={styles.container}>
            <main className={styles.main}>{children}</main>
            <Sidebar />
        </div>
    );
};

export default Layout;
