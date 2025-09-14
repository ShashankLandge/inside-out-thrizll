// src/components/UserCard.jsx
import React from "react";

export default function UserCard({ user, onSend, status }) {
  const renderButton = () => {
    if (status === "connected") {
      return (
        <button
          disabled
          className="btn-secondary flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Connected</span>
        </button>
      );
    }
    if (status === "requested") {
      return (
        <button
          disabled
          className="px-4 py-2 bg-peach bg-opacity-20 text-accent rounded-full flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Requested</span>
        </button>
      );
    }
    if (status === "incoming") {
      return (
        <button
          disabled
          className="px-4 py-2 bg-highlight bg-opacity-20 text-highlight rounded-full flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>Incoming</span>
        </button>
      );
    }
    return (
      <button
        onClick={() => onSend(user)}
        className="btn-primary flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Send Request</span>
      </button>
    );
  };

  return (
    <div className="card hover:scale-[1.01] transition-all duration-300 flex items-center justify-between p-4 mb-3">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-accent to-highlight rounded-full flex items-center justify-center text-xl font-semibold text-white shadow-lg">
          {user.name?.charAt(0) || "U"}
        </div>
        <div>
          <div className="font-semibold text-dark">{user.name}</div>
          <div className="text-sm text-accent flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {user.age
              ? <span>{user.age} • {user.location || "Unknown location"}</span>
              : <span>{user.location || "Unknown location"}</span>}
          </div>
          {user.profile?.status && (
            <div className="text-xs bg-secondary bg-opacity-50 text-dark px-2 py-1 rounded-full mt-2 inline-block">
              {user.profile.status}
            </div>
          )}
        </div>
      </div>
      <div>{renderButton()}</div>
    </div>
  );
}
