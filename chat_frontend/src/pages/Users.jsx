import React, { useEffect, useState } from "react";
import api from "../services/api";
import UserCard from "../components/UserCard";
import ChatList from "../components/ChatList";
import AnimatedWrapper from "../components/AnimatedWrapper";
import { useAuth } from "../contexts/AuthContext";

export default function Users() {
  const { user, socket } = useAuth();
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  async function load() {
    try {
      const [us, rs, inc, out] = await Promise.all([
        api.getUsers(),
        api.getRooms(),
        api.getRequests(true), // incoming
        api.getRequests(false), // outgoing
      ]);
      setUsers(us.filter((u) => u.id !== user.id));
      setRooms(rs);
      setIncoming(inc);
      setOutgoing(out);
    } catch (e) {
      console.error("Failed to load users data", e);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("incoming_request", load);
    socket.on("room_created", load);
    socket.on("receive_message", load);
    return () => {
      socket.off("incoming_request");
      socket.off("room_created");
      socket.off("receive_message");
    };
  }, [socket]);

  // build quick lookup sets
  const connectedIds = new Set();
  rooms.forEach((r) => {
    r.members.forEach((m) => {
      if (m.userId && m.userId !== user.id) connectedIds.add(m.userId);
    });
  });
  const outgoingIds = new Set(outgoing.map((r) => r.toUserId));
  const incomingIds = new Set(incoming.map((r) => r.fromUserId));

  async function sendRequest(target) {
    try {
      await api.sendRequest(target.id);
      alert("Request sent");
      await load();
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    }
  }

  async function respond(id, action) {
    try {
      await api.respondRequest(id, action);
      await load();
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    }
  }

  function getUserNameById(id) {
    if (!id) return id;
    const u = users.concat([user]).find((x) => x && x.id === id);
    return u ? u.name : id;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-1 md:col-span-2">
        <AnimatedWrapper animation="fade-in" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Discover</h3>
            <div className="text-sm text-gray-500">
              Connect with people nearby
            </div>
          </div>
        </AnimatedWrapper>

        <div className="space-y-4">
          {users.map((u, index) => {
            const isConnected = connectedIds.has(u.id);
            const hasOutgoing = outgoingIds.has(u.id);
            const hasIncoming = incomingIds.has(u.id);
            return (
              <AnimatedWrapper key={u.id} animation="slide-up" delay={index * 100} className="hover-lift">
                <UserCard
                  user={u}
                  onSend={isConnected || hasOutgoing ? undefined : sendRequest}
                  status={
                    isConnected
                      ? "connected"
                      : hasOutgoing
                      ? "requested"
                      : hasIncoming
                      ? "incoming"
                      : "available"
                  }
                />
                {hasIncoming && (
                  <div className="text-sm text-gray-500 mt-1 ml-4">
                    They have sent you a request — see sidebar to accept
                  </div>
                )}
              </AnimatedWrapper>
            );
          })}
        </div>
      </div>

      <aside className="col-span-1 space-y-6">
        <AnimatedWrapper animation="fade-in" delay={200}>
          <div className="card p-4">
            <h4 className="font-semibold mb-3 text-lg bg-clip-text text-transparent bg-gradient-to-r from-secondary to-accent">Requests</h4>
            <div className="space-y-3">
              {incoming.length === 0 && (
                <div className="text-sm text-gray-500">No pending requests</div>
              )}
              {incoming.map((r, index) => (
                <AnimatedWrapper key={r.id} animation="scale" delay={300 + index * 100}>
                  <div className="border-2 border-gray-100 rounded-lg p-3 flex items-center justify-between hover-scale">
                    <div>
                      <div className="font-medium">
                        From: {r.fromUser?.name || r.fromUserId}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => respond(r.id, "accept")}
                        className="btn-primary px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Accept
                      </button>
                      <button
                        onClick={() => respond(r.id, "reject")}
                        className="btn-secondary px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  </div>
                </AnimatedWrapper>
              ))}
            </div>
          </div>
        </AnimatedWrapper>

        <AnimatedWrapper animation="fade-in" delay={400}>
          <div className="card p-4">
            <h4 className="font-semibold mb-3 text-lg bg-clip-text text-transparent bg-gradient-to-r from-secondary to-accent">Active chats</h4>
            <ChatList rooms={rooms} />
          </div>
        </AnimatedWrapper>
      </aside>
    </div>
  );
}
