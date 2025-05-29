import React from 'react';
import { BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';

const App: React.FC = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;
