import { Request, Response } from "express";
import { prisma } from "../db/client";
import { AuthedRequest } from "../middleware/auth";

export async function getUser(req: Request, res: Response) {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, age: true, location: true },
  });
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json(user);
}

// GET /api/v1/users      (list users)
export async function listUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, age: true, location: true, profile: true },
  });
  res.json(users);
}

// GET /api/v1/users/me   (auth)
export async function getMe(req: AuthedRequest, res: Response) {
  const userId = req.userId!;
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      age: true,
      location: true,
      profile: true,
    },
  });
  res.json(u);
}

// PATCH /api/v1/users/me
export async function updateMe(req: AuthedRequest, res: Response) {
  const userId = req.userId!;
  const { name, age, location, profile } = req.body || {};

  const data: any = {};

  // Only set name if a non-empty string is provided
  if (typeof name === "string" && name.trim() !== "") data.name = name.trim();

  // Age: accept 0? typically no — but check for non-empty and a number
  if (age !== undefined && age !== null && age !== "") {
    const n = Number(age);
    if (Number.isNaN(n)) return res.status(400).json({ error: "Invalid age" });
    data.age = n;
  }

  // Location: only set if non-empty string
  if (typeof location === "string" && location.trim() !== "")
    data.location = location.trim();

  // Profile: accept object; if explicitly null or empty string skip update
  if (profile !== undefined && profile !== null) {
    // If front-end may send JSON as string, try to parse
    if (typeof profile === "string") {
      try {
        data.profile = JSON.parse(profile);
      } catch {
        // if invalid JSON string, return error
        return res.status(400).json({ error: "Invalid profile JSON" });
      }
    } else {
      data.profile = profile;
    }
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  try {
    const updated = await prisma.user.update({ where: { id: userId }, data });
    // Respond with safe fields
    return res.json({
      id: updated.id,
      name: updated.name,
      age: updated.age,
      location: updated.location,
      profile: updated.profile,
    });
  } catch (e: any) {
    console.error("updateMe error", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
