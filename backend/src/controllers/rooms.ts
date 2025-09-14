import { Response } from "express";
import { prisma } from "../db/client";
import { AuthedRequest } from "../middleware/auth";

export async function listRooms(req: AuthedRequest, res: Response) {
  const userId = req.userId!;
  const rooms = await prisma.room.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(rooms);
}

export async function listMessages(req: AuthedRequest, res: Response) {
  const userId = req.userId!;
  const { roomId } = req.params;
  const limit = Math.min(Number(req.query.limit || 50), 200);

  const isMember = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  if (!isMember) return res.status(403).json({ error: "Not a member" });

  const messages = await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  res.json(messages);
}

export async function sendMessageHttp(req: AuthedRequest, res: Response) {
  const userId = req.userId!;
  const { roomId } = req.params;
  const { text } = req.body || {};
  if (!text || !text.trim())
    return res.status(400).json({ error: "text required" });

  const isMember = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  if (!isMember) return res.status(403).json({ error: "Not a member" });

  const msg = await prisma.message.create({
    data: { roomId, senderId: userId, text },
  });

  const io = req.app.get("io");
  io?.to(roomId).emit("receive_message", { message: msg });

  res.status(201).json(msg);
}

// Tier request endpoints (simple)
export async function createTierRequest(req: AuthedRequest, res: Response) {
  const userId = req.userId!;
  const { roomId } = req.params;
  const { requestedTier } = req.body || {};
  if (!["tier1", "tier2", "tier3"].includes(requestedTier))
    return res.status(400).json({ error: "Invalid tier" });

  const isMember = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  if (!isMember) return res.status(403).json({ error: "Not a member" });

  const tr = await prisma.tierRequest.create({
    data: { roomId, requestedById: userId, requestedTier, status: "pending" },
  });

  // notify other members
  const others = await prisma.roomMember.findMany({
    where: { roomId, NOT: { userId } },
  });
  const io = req.app.get("io");
  for (const o of others)
    io?.to(`user:${o.userId}`).emit("tier_request", { request: tr });

  res.status(201).json(tr);
}

export async function respondTierRequest(req: AuthedRequest, res: Response) {
  const userId = req.userId!;
  const { roomId } = req.params;
  const { requestId, approve } = req.body || {};

  const tr = await prisma.tierRequest.findUnique({ where: { id: requestId } });
  if (!tr || tr.roomId !== roomId)
    return res.status(404).json({ error: "Tier request not found" });

  // basic membership check
  const isMember = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  if (!isMember) return res.status(403).json({ error: "Not a member" });

  if (!approve) {
    const updated = await prisma.tierRequest.update({
      where: { id: requestId },
      data: { status: "rejected" },
    });
    return res.json(updated);
  }

  // approve -> apply immediately (simplified MVP)
  const updated = await prisma.tierRequest.update({
    where: { id: requestId },
    data: { status: "approved" },
  });
  await prisma.room.update({
    where: { id: roomId },
    data: { tier: updated.requestedTier },
  });

  const io = req.app.get("io");
  io?.to(roomId).emit("tier_applied", {
    roomId,
    newTier: updated.requestedTier,
  });

  res.json({ request: updated, applied: true });
}

export async function getTierRequests(req: AuthedRequest, res: Response) {
  const userId = req.userId!;
  const { roomId } = req.params;

  // verify membership
  const member = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  if (!member) return res.status(403).json({ error: "Not a member" });

  const list = await prisma.tierRequest.findMany({
    where: { roomId, status: "pending" },
    include: {
      requestedBy: {
        select: { id: true, name: true, age: true, location: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  res.json(list);
}
