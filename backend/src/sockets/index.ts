import { Server, Socket } from "socket.io";
import { verifyJwt } from "../utils/jwt";
import { prisma } from "../db/client";

export function initSocket(io: Server) {
  io.use((socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string) ||
        socket.handshake.headers.authorization?.toString().split(" ")[1];
      if (!token) return next(new Error("No token"));
      const decoded = verifyJwt<{ userId: string }>(token);
      (socket as any).userId = decoded.userId;
      next();
    } catch {
      next(new Error("Auth error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId as string;
    socket.join(`user:${userId}`);

    socket.on(
      "join_room",
      async (payload: { roomId: string }, ack?: Function) => {
        try {
          const { roomId } = payload;
          const member = await prisma.roomMember.findUnique({
            where: { roomId_userId: { roomId, userId } },
          });
          if (!member) throw new Error("Not a member");
          socket.join(roomId);
          ack?.({ success: true });
        } catch (e: any) {
          ack?.({ success: false, error: e.message });
        }
      }
    );

    socket.on(
      "send_message",
      async (
        payload: { clientMsgId?: string; roomId: string; text: string },
        ack?: Function
      ) => {
        try {
          const { clientMsgId, roomId, text } = payload;
          if (!text || !text.trim()) throw new Error("text required");
          const member = await prisma.roomMember.findUnique({
            where: { roomId_userId: { roomId, userId } },
          });
          if (!member) throw new Error("Not a member");

          const msg = await prisma.message.create({
            data: { roomId, senderId: userId, text },
          });

          // Attach the clientMsgId so clients can dedupe/replace optimistic messages
          const emitted = { ...msg, clientMsgId };
          io.to(roomId).emit("receive_message", { message: emitted });

          // ack the sender with mapping (so the client can replace tmp id)
          ack?.({ success: true, clientMsgId, serverMessageId: msg.id });
        } catch (e: any) {
          ack?.({ success: false, error: e.message });
        }
      }
    );

    socket.on("typing", (payload: { roomId: string; isTyping: boolean }) => {
      const { roomId, isTyping } = payload;
      io.to(roomId).emit("typing", { roomId, userId, isTyping });
    });

    // inside sockets connection
    socket.on(
      "tier_request",
      async (
        payload: { roomId: string; requestedTier: "tier1" | "tier2" | "tier3" },
        ack?: Function
      ) => {
        try {
          const { roomId, requestedTier } = payload;
          const member = await prisma.roomMember.findUnique({
            where: { roomId_userId: { roomId, userId } },
          });
          if (!member) throw new Error("Not a member");

          // Create tier request and include requester basic info
          const tr = await prisma.tierRequest.create({
            data: {
              roomId,
              requestedById: userId,
              requestedTier,
              status: "pending",
            },
            include: {
              requestedBy: {
                select: { id: true, name: true, age: true, location: true },
              },
            },
          });

          // notify other members (include requester details)
          const others = await prisma.roomMember.findMany({
            where: { roomId, NOT: { userId } },
          });
          for (const o of others)
            io.to(`user:${o.userId}`).emit("tier_request", { request: tr });

          ack?.({ success: true, requestId: tr.id });
        } catch (e: any) {
          ack?.({ success: false, error: e.message });
        }
      }
    );

    socket.on(
      "tier_respond",
      async (
        payload: { requestId: string; approve: boolean },
        ack?: Function
      ) => {
        try {
          const { requestId, approve } = payload;
          const tr = await prisma.tierRequest.findUnique({
            where: { id: requestId },
          });
          if (!tr) throw new Error("Not found");

          const member = await prisma.roomMember.findUnique({
            where: { roomId_userId: { roomId: tr.roomId, userId } },
          });
          if (!member) throw new Error("Not a member");

          if (!approve) {
            const updated = await prisma.tierRequest.update({
              where: { id: requestId },
              data: { status: "rejected" },
            });
            ack?.({ success: true, request: updated });
            return;
          }

          const updated = await prisma.tierRequest.update({
            where: { id: requestId },
            data: { status: "approved" },
          });
          await prisma.room.update({
            where: { id: tr.roomId },
            data: { tier: updated.requestedTier },
          });
          io.to(tr.roomId).emit("tier_applied", {
            roomId: tr.roomId,
            newTier: updated.requestedTier,
          });
          ack?.({ success: true, request: updated, applied: true });
        } catch (e: any) {
          ack?.({ success: false, error: e.message });
        }
      }
    );
  });
}
