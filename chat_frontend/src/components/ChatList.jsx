import React from "react";
import { Link } from "react-router-dom";
import AnimatedWrapper from "./AnimatedWrapper";
import { useAuth } from "../contexts/AuthContext";

export default function ChatList({ rooms }) {
  if (!rooms || rooms.length === 0)
    return <div className="text-gray-500">No active chats yet.</div>;
  const { user } = useAuth();
  return (
    <div className="space-y-3">
      {rooms.map((r, index) => (
        <AnimatedWrapper key={r.id} animation="scale" delay={index * 100}>
          <Link
            to={`/rooms/${r.id}`}
            className="block p-3 rounded-lg border-2 border-gray-100 hover-scale transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {(() => {
                    const other = r.members.find(
                      (m) => m.user && m.user.id !== user.id
                    );
                    return other ? other.user.name : "Unknown";
                  })()}
                </div>
                <div className="text-xs text-gray-500">{r.tier}</div>
              </div>
              <div className="text-sm text-primary flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Open
              </div>
            </div>
          </Link>
        </AnimatedWrapper>
      ))}
    </div>
  );
}
