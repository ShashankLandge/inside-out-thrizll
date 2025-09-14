import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  listRooms,
  listMessages,
  sendMessageHttp,
  createTierRequest,
  respondTierRequest,
  getTierRequests,
} from "../controllers/rooms";

export const roomsRouter = Router();
roomsRouter.use(requireAuth);

roomsRouter.get("/", listRooms);
roomsRouter.get("/:roomId/messages", listMessages);
roomsRouter.post("/:roomId/messages", sendMessageHttp);

roomsRouter.post("/:roomId/tier-request", createTierRequest);
roomsRouter.get("/:roomId/tier-requests", getTierRequests);
roomsRouter.post("/:roomId/tier-respond", respondTierRequest);
