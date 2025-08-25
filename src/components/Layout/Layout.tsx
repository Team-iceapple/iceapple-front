import React from 'react';
import Sidebar from '../Sidebar/Sidebar.tsx';
import styles from './Layout.module.css';
import {Footer} from "../Footer/Footer.tsx";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    console.log("Layout children:", children);
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
