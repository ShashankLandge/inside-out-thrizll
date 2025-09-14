import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Chats from "./pages/Chats";
import ChatRoom from "./pages/ChatRoom";
import GamesPage from "./games/Games";
import { useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/users" /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/users"
            element={user ? <Users /> : <Navigate to="/login" />}
          />
          <Route
            path="/chats"
            element={user ? <Chats /> : <Navigate to="/login" />}
          />
          <Route
            path="/rooms/:id"
            element={user ? <ChatRoom /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/onboard"
            element={user ? <GamesPage /> : <Navigate to="/login" />}
          />
          '
        </Routes>
      </main>
    </div>
  );
}
