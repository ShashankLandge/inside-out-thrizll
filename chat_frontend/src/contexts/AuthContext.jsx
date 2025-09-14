import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { createSocket } from "../services/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const initialToken = localStorage.getItem("token");
  const initialUser = JSON.parse(localStorage.getItem("user") || "null");

  // set token in axios synchronously so early API calls include Authorization
  if (initialToken) api.setToken(initialToken);

  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(initialUser);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]); // future: show UI to list them

  // when token changes, create socket connection
  useEffect(() => {
    if (!token) {
      // cleanup
      api.setToken(null);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // ensure axios also has token
    api.setToken(token);

    // create a socket, connect and attach some global handlers
    const s = createSocket(token);
    setSocket(s);
    s.connect();

    s.on("connect", () => console.log("socket connected"));
    s.on("tier_request", (payload) => {
      // collect incoming tier requests globally
      setNotifications((n) => [...n, { type: "tier_request", payload }]);
    });
    // additional global handlers (incoming_request, room_created, etc) can be processed here if needed

    return () => {
      s.off("tier_request");
      s.disconnect();
      setSocket(null);
    };
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = ({ token: newToken, user: newUser }) => {
    if (newToken) setToken(newToken);
    if (newUser) setUser((prev) => ({ ...(prev || {}), ...newUser }));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, socket, notifications }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
