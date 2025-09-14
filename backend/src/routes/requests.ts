import { Router } from "express";
import { createRequest } from "../controllers/requests";
import { respondRequest } from "../controllers/requests_respond";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../db/client";
import { ReqStatus } from "@prisma/client";
import { AuthedRequest } from "../middleware/auth";

export const requestsRouter = Router();
requestsRouter.use(requireAuth);

// create request
requestsRouter.post("/", createRequest);

// list incoming or outgoing
requestsRouter.get("/", async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const incoming = req.query.incoming === "true";

  const where = incoming
    ? { toUserId: userId, status: ReqStatus.pending }
    : { fromUserId: userId };
  const data = await prisma.userRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      fromUser: { select: { id: true, name: true, age: true, location: true } },
      toUser: { select: { id: true, name: true, age: true, location: true } },
    },
  });

  res.json(data);
});

// respond
requestsRouter.post("/:id/respond", respondRequest);
