import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout.tsx';
import Home from './pages/Home';
import Notice from './pages/Notice';
import Project from './pages/Project';

const App: React.FC = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/notice" element={<Notice />} />
                    <Route path="/notice/:id" element={<Notice />} />
                    <Route path="/project" element={<Project />} />
                </Routes>
            </Layout>
        </Router>
    );
};


export default App;
