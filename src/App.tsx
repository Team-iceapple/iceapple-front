import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home/Home";
import Project from "./pages/Project/Project";
import ProjectDetail from "./pages/Project/ProjectDetail";
import Notice from "./pages/Notice/Notice";
import Room from "./pages/Room/Room";
import RoomReservation from "./pages/Room/RoomReservation";
import Sojoong from "./pages/Sojoong/Sojoong";

const App: React.FC = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/notice" element={<Notice />} />
                    <Route path="/notice/:id" element={<Notice />} />
                    <Route path="/sojoong" element={<Sojoong />} />
                    <Route path="/sojoong/:id" element={<Sojoong />} />
                    <Route path="/works" element={<Project />} />
                    <Route path="/works/:workid" element={<ProjectDetail />} />
                    <Route path="/rooms" element={<Room />} />
                    <Route path="/rooms/:roomId" element={<RoomReservation />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;
