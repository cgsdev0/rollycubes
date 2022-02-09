import { NextFunction, Request, Response } from "express";
import * as fs from "fs";

const preSharedKey = fs
  .readFileSync("./secrets/.pre-shared-key")
  .toString()
  .trim();

export const verifyPreSharedKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parts = (req.header("Authorization") || "").split(" ");
  if (parts.length !== 2 || parts[1] !== preSharedKey) {
    return res.status(403).send("server authorization failed");
  }
  return next();
};
