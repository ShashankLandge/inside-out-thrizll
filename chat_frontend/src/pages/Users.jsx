import React, { useEffect, useState } from "react";
import api from "../services/api";
import UserCard from "../components/UserCard";
import ChatList from "../components/ChatList";
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
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Discover</h3>
          <div className="text-sm text-gray-500">
            Connect with people nearby
          </div>
        </div>

        <div className="space-y-3">
          {users.map((u) => {
            const isConnected = connectedIds.has(u.id);
            const hasOutgoing = outgoingIds.has(u.id);
            const hasIncoming = incomingIds.has(u.id);
            return (
              <div key={u.id}>
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
              </div>
            );
          })}
        </div>
      </div>

      <aside className="col-span-1 space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Requests</h4>
          <div className="space-y-2">
            {incoming.length === 0 && (
              <div className="text-sm text-gray-500">No pending requests</div>
            )}
            {incoming.map((r) => (
              <div
                key={r.id}
                className="border rounded p-2 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">
                    From: {r.fromUser?.name || r.fromUserId}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => respond(r.id, "accept")}
                    className="px-2 py-1 bg-green-600 text-white rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respond(r.id, "reject")}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded border"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Active chats</h4>
          <ChatList rooms={rooms} />
        </div>
      </aside>
    </div>
  );
}
