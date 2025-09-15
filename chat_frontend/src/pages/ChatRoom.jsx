// // src/pages/ChatRoom.jsx
// import React, { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../services/api";
// import { useAuth } from "../contexts/AuthContext";

// function genClientId() {
//   return "cmsg-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
// }

// function IconAudio({ enabled }) {
//   // Simple microphone icon — filled when enabled, outline/blur when disabled
//   return (
//     <svg
//       className={`w-6 h-6 ${
//         enabled
//           ? "text-indigo-600"
//           : "text-gray-300 filter grayscale opacity-60"
//       }`}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//     >
//       <path
//         strokeWidth="1.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M12 1v11m0 0a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3z"
//       ></path>
//       <path
//         strokeWidth="1.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M19 11v2a7 7 0 0 1-14 0v-2"
//       ></path>
//     </svg>
//   );
// }

// function IconFile({ enabled }) {
//   // Simple paperclip / file icon
//   return (
//     <svg
//       className={`w-6 h-6 ${
//         enabled
//           ? "text-indigo-600"
//           : "text-gray-300 filter grayscale opacity-60"
//       }`}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//     >
//       <path
//         strokeWidth="1.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M21 15v4a2 2 0 0 1-2 2H7l-4-4V7a2 2 0 0 1 2-2h8"
//       ></path>
//       <path
//         strokeWidth="1.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M7 7v10a2 2 0 0 0 2 2h10"
//       ></path>
//     </svg>
//   );
// }

// export default function ChatRoom() {
//   const { id } = useParams();
//   const { socket, user } = useAuth();
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const [room, setRoom] = useState(null);
//   const [pendingTierRequest, setPendingTierRequest] = useState(null);
//   const bottomRef = useRef();
//   const fileInputRef = useRef();

//   useEffect(() => {
//     let mounted = true;
//     async function load() {
//       try {
//         const msgs = await api.getMessages(id, 100);
//         const ordered = Array.isArray(msgs) ? msgs.slice().reverse() : msgs;
//         if (!mounted) return;
//         setMessages(ordered);
//         const rooms = await api.getRooms();
//         const r = rooms.find((r) => r.id === id);
//         setRoom(r);

//         // load persistent tier requests
//         try {
//           const tierPending = await api.getTierRequests(id);
//           if (!mounted) return;
//           if (tierPending && tierPending.length > 0)
//             setPendingTierRequest(tierPending[0]);
//           else setPendingTierRequest(null);
//         } catch (e) {
//           console.warn("Could not fetch tier requests", e);
//         }
//       } catch (e) {
//         console.error(e);
//       }
//     }
//     load();
//     return () => {
//       mounted = false;
//     };
//   }, [id]);

//   useEffect(() => {
//     if (!socket) return;
//     socket.emit("join_room", { roomId: id }, (ack) => {
//       if (!ack.success) console.error("join failed", ack);
//     });

//     const onReceive = (p) => {
//       const m = p?.message;
//       if (!m) return;
//       // If message has clientMsgId and we have a tmp message with same clientMsgId, replace it
//       if (m.clientMsgId) {
//         let replaced = false;
//         setMessages((prev) =>
//           prev.map((pm) => {
//             if (pm.clientMsgId && pm.clientMsgId === m.clientMsgId) {
//               replaced = true;
//               return m;
//             }
//             return pm;
//           })
//         );
//         if (replaced) return;
//       }

//       // Avoid duplicate message by id
//       setMessages((prev) => {
//         if (prev.some((x) => x.id === m.id)) return prev;
//         return [...prev, m];
//       });
//     };

//     const onTierReq = (payload) => {
//       if (!payload?.request) return;
//       if (payload.request.roomId === id) {
//         setPendingTierRequest(payload.request);
//       }
//     };

//     socket.on("receive_message", onReceive);
//     socket.on("tier_request", onTierReq);
//     socket.on("tier_applied", (p) => {
//       if (p?.roomId === id) setRoom((r) => ({ ...r, tier: p.newTier }));
//     });

//     return () => {
//       socket.off("receive_message", onReceive);
//       socket.off("tier_request", onTierReq);
//       socket.off("tier_applied");
//     };
//   }, [socket, id]);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   function send() {
//     if (!text.trim()) return;
//     const clientMsgId = genClientId();
//     const tmp = {
//       id: clientMsgId,
//       clientMsgId,
//       text,
//       senderId: user.id,
//       createdAt: new Date().toISOString(),
//       roomId: id,
//     };
//     setMessages((m) => [...m, tmp]);
//     socket.emit("send_message", { clientMsgId, roomId: id, text }, (ack) => {
//       if (!ack || !ack.success) {
//         setMessages((prev) =>
//           prev.filter((x) => x.clientMsgId !== clientMsgId)
//         );
//         alert("send failed: " + (ack?.error || "unknown"));
//       }
//     });
//     setText("");
//   }

//   async function requestTier() {
//     if (!room) return;
//     const next =
//       room.tier === "tier1" ? "tier2" : room.tier === "tier2" ? "tier3" : null;
//     if (!next) return; // already maxed
//     socket.emit("tier_request", { roomId: id, requestedTier: next }, (ack) => {
//       if (ack?.success) alert("Tier upgrade requested");
//       else alert("Failed: " + (ack?.error || "unknown"));
//     });
//   }

//   async function handleTierRespond(approve) {
//     if (!pendingTierRequest) return;
//     socket.emit(
//       "tier_respond",
//       { requestId: pendingTierRequest.id, approve },
//       (ack) => {
//         if (ack?.success) {
//           setPendingTierRequest(null);
//           if (approve) alert("Tier upgraded");
//         } else {
//           alert("Failed: " + (ack?.error || "unknown"));
//         }
//       }
//     );
//   }

//   // UI helpers
//   const canAudio = room && (room.tier === "tier2" || room.tier === "tier3");
//   const canFile = room && room.tier === "tier3";
//   const showRequestTier = room && room.tier !== "tier3";

//   function onFileClick() {
//     if (!canFile) {
//       // show tooltip already handled via hover, but on click notify
//       alert("File sending unlocks at Tier 3. Request upgrade to unlock.");
//       return;
//     }
//     fileInputRef.current?.click();
//   }

//   function onFileChange(e) {
//     const f = e.target.files && e.target.files[0];
//     if (!f) return;
//     // For MVP we do not upload; just notify the user
//     alert("Media sending not implemented in MVP. Selected file: " + f.name);
//     e.target.value = "";
//   }

//   return (
//     <div className="max-w-3xl mx-auto">
//       <div className="bg-white p-4 rounded shadow mb-4 flex items-center justify-between">
//         <div>
//           <div className="font-semibold">Chat Room</div>
//           <div className="text-sm text-gray-500">Tier: {room?.tier}</div>
//         </div>

//         <div className="flex items-center gap-3">
//           {/* Audio icon with tooltip */}
//           <div className="relative">
//             <button
//               title={canAudio ? "Audio (enabled)" : "Unlocks at Tier 2"}
//               onClick={() => {
//                 if (!canAudio) {
//                   alert("Audio unlocks at Tier 2");
//                 } else {
//                   alert("Audio flow not implemented in MVP");
//                 }
//               }}
//               className={`p-2 rounded ${canAudio ? "hover:bg-indigo-50" : ""}`}
//             >
//               <IconAudio enabled={canAudio} />
//             </button>
//             {!canAudio && (
//               <div
//                 className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none"
//                 style={{ transform: "translateX(-50%)" }}
//                 aria-hidden="true"
//               >
//                 Unlocks at Tier 2
//               </div>
//             )}
//           </div>

//           {/* File icon */}
//           <div className="relative">
//             <button
//               title={
//                 canFile ? "Send media (images & video)" : "Unlocks at Tier 3"
//               }
//               onClick={onFileClick}
//               className={`p-2 rounded ${canFile ? "hover:bg-indigo-50" : ""}`}
//             >
//               <IconFile enabled={canFile} />
//             </button>
//             {!canFile && (
//               <div
//                 className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded"
//                 style={{ transform: "translateX(-50%)" }}
//               >
//                 {room && room.tier === "tier1"
//                   ? "Unlocks at Tier 3"
//                   : "Unlocks at Tier 3"}
//               </div>
//             )}
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*,video/*"
//               onChange={onFileChange}
//               className="hidden"
//             />
//           </div>

//           {/* Request tier button — hide if already tier3 */}
//           {showRequestTier && (
//             <div>
//               <button
//                 onClick={requestTier}
//                 className="px-3 py-1 border rounded"
//               >
//                 Request Tier
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {pendingTierRequest && (
//         <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="font-medium">
//                 Tier upgrade requested to {pendingTierRequest.requestedTier}
//               </div>
//               <div className="text-sm text-gray-600">
//                 Requested by:{" "}
//                 {pendingTierRequest.requestedBy?.name ||
//                   pendingTierRequest.requestedById}
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handleTierRespond(true)}
//                 className="px-3 py-1 bg-green-600 text-white rounded"
//               >
//                 Accept
//               </button>
//               <button
//                 onClick={() => handleTierRespond(false)}
//                 className="px-3 py-1 border rounded"
//               >
//                 Reject
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="bg-white p-4 rounded shadow h-[60vh] overflow-y-auto space-y-3">
//         {messages.map((m) => (
//           <div
//             key={m.id}
//             className={`flex ${
//               m.senderId === user.id ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`${
//                 m.senderId === user.id
//                   ? "bg-indigo-600 text-white"
//                   : "bg-gray-100 text-gray-800"
//               } p-2 rounded max-w-[70%]`}
//             >
//               <div className="text-sm">{m.text}</div>
//               <div className="text-xs text-gray-300 mt-1">
//                 {new Date(m.createdAt).toLocaleTimeString()}
//               </div>
//             </div>
//           </div>
//         ))}
//         <div ref={bottomRef} />
//       </div>

//       <div className="mt-3 flex gap-2">
//         <input
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           className="flex-1 p-2 border rounded"
//           placeholder="Write a message..."
//         />
//         <button
//           onClick={send}
//           className="px-4 py-2 bg-indigo-600 text-white rounded"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }

// src/pages/ChatRoom.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function genClientId() {
  return "cmsg-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

function IconAudio({ enabled }) {
  return (
    <svg
      className={`w-6 h-6 ${
        enabled
          ? "text-indigo-600"
          : "text-gray-300 filter grayscale opacity-60"
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 1v11m0 0a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3z"
      ></path>
      <path
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11v2a7 7 0 0 1-14 0v-2"
      ></path>
    </svg>
  );
}

function IconFile({ enabled }) {
  return (
    <svg
      className={`w-6 h-6 ${
        enabled
          ? "text-indigo-600"
          : "text-gray-300 filter grayscale opacity-60"
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 15v4a2 2 0 0 1-2 2H7l-4-4V7a2 2 0 0 1 2-2h8"
      ></path>
      <path
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 7v10a2 2 0 0 0 2 2h10"
      ></path>
    </svg>
  );
}

export default function ChatRoom() {
  const { id } = useParams();
  const { socket, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [room, setRoom] = useState(null);
  const [pendingTierRequest, setPendingTierRequest] = useState(null);
  const bottomRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const msgs = await api.getMessages(id, 100);
        const ordered = Array.isArray(msgs) ? msgs.slice().reverse() : msgs;
        if (!mounted) return;
        setMessages(ordered);
        const rooms = await api.getRooms();
        const r = rooms.find((r) => r.id === id);
        setRoom(r);

        // fetch persistent tier requests
        try {
          const tierPending = await api.getTierRequests(id);
          if (!mounted) return;
          if (tierPending && tierPending.length > 0)
            setPendingTierRequest(tierPending[0]);
          else setPendingTierRequest(null);
        } catch (e) {
          console.warn("Could not fetch tier requests", e);
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join_room", { roomId: id }, (ack) => {
      if (!ack.success) console.error("join failed", ack);
    });

    const onReceive = (p) => {
      const m = p?.message;
      if (!m) return;
      if (m.clientMsgId) {
        let replaced = false;
        setMessages((prev) =>
          prev.map((pm) => {
            if (pm.clientMsgId && pm.clientMsgId === m.clientMsgId) {
              replaced = true;
              return m;
            }
            return pm;
          })
        );
        if (replaced) return;
      }
      setMessages((prev) => {
        if (prev.some((x) => x.id === m.id)) return prev;
        return [...prev, m];
      });
    };

    const onTierReq = (payload) => {
      if (!payload?.request) return;
      if (payload.request.roomId === id) setPendingTierRequest(payload.request);
    };

    socket.on("receive_message", onReceive);
    socket.on("tier_request", onTierReq);
    socket.on("tier_applied", (p) => {
      if (p?.roomId === id) setRoom((r) => ({ ...r, tier: p.newTier }));
    });

    return () => {
      socket.off("receive_message", onReceive);
      socket.off("tier_request", onTierReq);
      socket.off("tier_applied");
    };
  }, [socket, id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    if (!text.trim()) return;
    const clientMsgId = genClientId();
    const tmp = {
      id: clientMsgId,
      clientMsgId,
      text,
      senderId: user.id,
      createdAt: new Date().toISOString(),
      roomId: id,
    };
    setMessages((m) => [...m, tmp]);
    socket.emit("send_message", { clientMsgId, roomId: id, text }, (ack) => {
      if (!ack || !ack.success) {
        setMessages((prev) =>
          prev.filter((x) => x.clientMsgId !== clientMsgId)
        );
        alert("send failed: " + (ack?.error || "unknown"));
      }
    });
    setText("");
  }

  async function requestTier() {
    if (!room) return;
    const next =
      room.tier === "tier1" ? "tier2" : room.tier === "tier2" ? "tier3" : null;
    if (!next) return;
    socket.emit("tier_request", { roomId: id, requestedTier: next }, (ack) => {
      if (ack?.success) alert("Tier upgrade requested");
      else alert("Failed: " + (ack?.error || "unknown"));
    });
  }

  async function handleTierRespond(approve) {
    if (!pendingTierRequest) return;
    socket.emit(
      "tier_respond",
      { requestId: pendingTierRequest.id, approve },
      (ack) => {
        if (ack?.success) {
          setPendingTierRequest(null);
          if (approve) alert("Tier upgraded");
        } else {
          alert("Failed: " + (ack?.error || "unknown"));
        }
      }
    );
  }

  // UI helpers
  const canAudio = room && (room.tier === "tier2" || room.tier === "tier3");
  const canFile = room && room.tier === "tier3";
  const showRequestTier = room && room.tier !== "tier3";

  function onFileClick() {
    if (!canFile) {
      alert("File sending unlocks at Tier 3. Request upgrade to unlock.");
      return;
    }
    fileInputRef.current?.click();
  }

  function onFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    alert("Media sending not implemented in MVP. Selected file: " + f.name);
    e.target.value = "";
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-4 rounded shadow mb-4 flex items-center justify-between">
        <div>
          <div className="font-semibold">Chat Room</div>
          <div className="text-sm text-gray-500">Tier: {room?.tier}</div>
        </div>

        {showRequestTier && (
          <div>
            <button onClick={requestTier} className="px-3 py-1 border rounded">
              Request Tier
            </button>
          </div>
        )}
      </div>

      {pendingTierRequest && (
        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">
                Tier upgrade requested to {pendingTierRequest.requestedTier}
              </div>
              <div className="text-sm text-gray-600">
                Requested by:{" "}
                {pendingTierRequest.requestedBy?.name ||
                  pendingTierRequest.requestedById}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleTierRespond(true)}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Accept
              </button>
              <button
                onClick={() => handleTierRespond(false)}
                className="px-3 py-1 border rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded shadow h-[60vh] overflow-y-auto space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.senderId === user.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`${
                m.senderId === user.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800"
              } p-2 rounded max-w-[70%]`}
            >
              <div className="text-sm">{m.text}</div>
              <div className="text-xs text-gray-300 mt-1">
                {new Date(m.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!canAudio) alert("Audio unlocks at Tier 2");
              else alert("Audio not implemented in MVP");
            }}
            className="p-2 rounded"
            title={canAudio ? "Audio (enabled)" : "Unlocks at Tier 2"}
          >
            <IconAudio enabled={canAudio} />
          </button>

          <button
            onClick={onFileClick}
            className="p-2 rounded"
            title={canFile ? "Send media" : "Unlocks at Tier 3"}
          >
            <IconFile enabled={canFile} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        <div className="flex flex-1 min-w-0 items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 p-2 border rounded w-full"
            placeholder="Write a message..."
          />
          <button
            onClick={send}
            className="px-4 py-2 bg-indigo-600 text-white rounded whitespace-nowrap"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
