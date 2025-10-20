import React, {useEffect} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home/Home";
import Project from "./pages/Project/Project";
import ProjectDetail from "./pages/Project/ProjectDetail";
import Notice from "./pages/Notice/Notice";
import Room from "./pages/Room/Room";
import RoomReservation from "./pages/Room/RoomReservation";
import Sojoong from "./pages/Sojoong/Sojoong";
import Dashboard from "./pages/Dashboard/Dashboard";

const App: React.FC = () => {

    useEffect(() => {
        const blockDrag = (e: Event) => e.preventDefault();
        document.addEventListener("dragstart", blockDrag, { passive: false });
        document.addEventListener("drop", blockDrag, { passive: false });
        return () => {
            document.removeEventListener("dragstart", blockDrag);
            document.removeEventListener("drop", blockDrag);
        };
    }, []);


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
                    <Route path="/dashboard/:slug" element={<Dashboard />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;
