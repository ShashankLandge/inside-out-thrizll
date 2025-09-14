import { Router } from "express";
import { getUser, listUsers, getMe, updateMe } from "../controllers/users";
import { requireAuth } from "../middleware/auth";

export const usersRouter = Router();
usersRouter.get("/:id", getUser);
usersRouter.get("/", listUsers);

usersRouter.get("/", listUsers);
usersRouter.get("/me", requireAuth, getMe);
usersRouter.patch("/me", requireAuth, updateMe);
usersRouter.get("/:id", getUser);
