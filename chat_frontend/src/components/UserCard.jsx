// src/components/UserCard.jsx
import React from "react";

export default function UserCard({ user, onSend, status }) {
  const renderButton = () => {
    if (status === "connected") {
      return (
        <button
          disabled
          className="px-3 py-1 bg-gray-200 text-gray-500 rounded"
        >
          Connected
        </button>
      );
    }
    if (status === "requested") {
      return (
        <button
          disabled
          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded border"
        >
          Requested
        </button>
      );
    }
    if (status === "incoming") {
      return (
        <button
          disabled
          className="px-3 py-1 bg-blue-50 text-blue-700 rounded border"
        >
          Incoming
        </button>
      );
    }
    return (
      <button
        onClick={() => onSend(user)}
        className="px-3 py-1 bg-indigo-600 text-white rounded"
      >
        Send Request
      </button>
    );
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded hover:shadow-sm bg-white">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold">
          {user.name?.charAt(0) || "U"}
        </div>
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-gray-500">
            {user.age
              ? `${user.age} • ${user.location || "Unknown"}`
              : user.location || ""}
          </div>
          {user.profile?.status && (
            <div className="text-xs text-gray-600 mt-1">
              {user.profile.status}
            </div>
          )}
        </div>
      </div>
      <div>{renderButton()}</div>
    </div>
  );
}
