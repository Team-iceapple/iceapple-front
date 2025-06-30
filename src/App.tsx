import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout.tsx';
import Home from './pages/Home/Home.tsx';
import Project from './pages/Project/Project.tsx';
import ProjectDetail from "./pages/Project/ProjectDetail.tsx";
import Notice from "./pages/Notice/Notice.tsx";


const App: React.FC = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/notice" element={<Notice />} />
                    <Route path="/notice/:id" element={<Notice />} />
                    <Route path="/works" element={<Project />} />
                    <Route path="/works/:workid" element={<ProjectDetail />} />
                </Routes>
            </Layout>
        </Router>
    );
};


export default App;
