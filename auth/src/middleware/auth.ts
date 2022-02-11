import { NextFunction, Request, Response } from "express";
import * as fs from "fs";

import jwt = require("jsonwebtoken");

export const publicKey = fs.readFileSync("./secrets/.id.pub");

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, publicKey);
    res.locals.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};
