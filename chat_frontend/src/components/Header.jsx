import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { user, logout, socket } = useAuth();
  const navigate = useNavigate();
  async function handleLogout() {
    logout();
    navigate("/login");
    if (socket) socket.disconnect();
  }
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
            I-O
          </div>
          <div>
            <div className="text-lg font-semibold">Inside-Out</div>
            <div className="text-xs text-gray-500">A new way to date</div>
          </div>
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/users"
                className="text-sm text-gray-700 hover:text-indigo-600"
              >
                Users
              </Link>
              <Link
                to="/chats"
                className="text-sm text-gray-700 hover:text-indigo-600"
              >
                Chats
              </Link>
              <Link
                to="/profile"
                className="text-sm text-gray-700 hover:text-indigo-600"
              >
                Profile
              </Link>
              <div className="flex items-center gap-3">
                <div className="text-sm">{user.name}</div>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-1 border rounded"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-700 hover:text-indigo-600"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm text-gray-700 hover:text-indigo-600"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
