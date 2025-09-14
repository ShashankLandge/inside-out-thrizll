import { Response } from 'express';
import { prisma } from '../db/client';
import { AuthedRequest } from '../middleware/auth';

export async function respondRequest(req: AuthedRequest, res: Response) {
  const userId = req.userId!;
  const { id } = req.params;
  const { action } = req.body || {};
  if (!['accept','reject'].includes(action)) return res.status(400).json({ error: 'action must be accept|reject' });

  const reqRow = await prisma.userRequest.findUnique({ where: { id } });
  if (!reqRow || reqRow.toUserId != userId) return res.status(404).json({ error: 'Request not found' });
  if (reqRow.status != 'pending') return res.status(400).json({ error: 'Already handled' });

  if (action === 'reject') {
    const updated = await prisma.userRequest.update({ where: { id }, data: { status: 'rejected' } });
    return res.json(updated);
  }

  // accept -> mark accepted and create room + membership
  const updated = await prisma.userRequest.update({ where: { id }, data: { status: 'accepted' } });

  const room = await prisma.room.create({
    data: {
      createdById: reqRow.fromUserId,
      tier: 'tier1',
      members: {
        create: [
          { userId: reqRow.fromUserId },
          { userId }
        ]
      }
    },
    include: { members: true }
  });

  const io = req.app.get('io');
  io?.to(`user:${reqRow.fromUserId}`).emit('room_created', { room });
  io?.to(`user:${userId}`).emit('room_created', { room });

  return res.json({ request: updated, room });
}
