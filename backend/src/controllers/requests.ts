import { Response } from "express";
import { prisma } from "../db/client";
import { AuthedRequest } from "../middleware/auth";

export async function createRequest(req: AuthedRequest, res: Response) {
  const userId = req.userId!;
  const { toUserId } = req.body || {};
  if (!toUserId) return res.status(400).json({ error: "toUserId required" });
  if (toUserId === userId)
    return res.status(400).json({ error: "Cannot request yourself" });

  try {
    // include minimal requester info (so frontend can show name)
    const created = await prisma.userRequest.create({
      data: { fromUserId: userId, toUserId, status: "pending" },
      include: {
        fromUser: {
          select: { id: true, name: true, age: true, location: true },
        },
      },
    });

    // notify the recipient via socket (join user room 'user:<id>' in socket layer)
    const io = req.app.get("io");
    io?.to(`user:${toUserId}`).emit("incoming_request", { request: created });

    return res.status(201).json(created);
  } catch (e: any) {
    // handle duplicate unique constraint (fromUserId,toUserId)
    if (e?.code === "P2002" || e?.code === "23505") {
      return res.status(409).json({ error: "Request already exists" });
    }
    console.error("createRequest error", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
