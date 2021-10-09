import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";

export class UserController {
  async all(request: Request, response: Response, next: NextFunction) {
    return User.find();
  }

  async one(request: Request, response: Response, next: NextFunction) {
    return User.findOne(request.params.id, {
      relations: ["stats", "userToAchievements"],
    });
  }

  async register(request: Request, response: Response, next: NextFunction) {
    try {
      const user = new User();
      user.username = request.body.username;
      const hashed_password = await bcrypt.hash(request.body.password, 10);
      user.hashed_password = hashed_password;
      await user.save();
      return "success";
    } catch (e) {
      response.status(500);
      return e;
    }
  }
}

