import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./Components/Home";
import ChatRoom from "./Components/ChatRoom";

function App() {
    const [username, setUsername] = useState("");

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home setUsername={setUsername} />} />
                <Route path="/chat/:room" element={<ChatRoom username={username} />} />
            </Routes>
        </Router>
    );
}

export default App;