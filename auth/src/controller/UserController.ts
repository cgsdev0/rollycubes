import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { RefreshToken } from "../entity/RefreshToken";
import { EntityNotFoundError } from "typeorm";
import * as fs from "fs";
import { publicKey } from "../middleware/auth";

const jwtConfig = {
  key: fs.readFileSync(".id"),
  passphrase: process.env.ROLLY_CUBES_AUTH_PASSPHRASE,
};

export class UserController {
  async pubkey(request: Request, response: Response, next: NextFunction) {
    return { publicKey: publicKey.toString() };
  }

  async all(request: Request, response: Response, next: NextFunction) {
    return User.find();
  }

  async one(request: Request, response: Response, next: NextFunction) {
    return User.findOne(request.params.id, {
      relations: ["stats", "userToAchievements"],
    });
  }

  async me(request: Request, response: Response, next: NextFunction) {
    return User.findOne(response.locals.user.id, {
      relations: ["stats"],
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
      return "error";
    }
  }

  async login(request: Request, response: Response, next: NextFunction) {
    try {
      const user = await User.findOneOrFail({
        select: ["hashed_password", "username", "id"],
        where: { username: request.body.username },
      });

      if (await bcrypt.compare(request.body.password, user.hashed_password)) {
        const refresh_token = new RefreshToken();
        refresh_token.user = user;
        await refresh_token.save();

        const access_token = jwt.sign(
          { user_id: user.id, display_name: user.username },
          jwtConfig,
          {
            expiresIn: "2h",
            algorithm: "RS256",
          }
        );
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);

        response.cookie("refresh_token", refresh_token.id, {
          secure: true,
          httpOnly: true,
          sameSite: "none",
          expires,
        });

        return { access_token };
      }
      response.status(401);
      return "forbidden";
    } catch (e) {
      response.status(500);
      console.error(e);
      return "error";
    }
  }

  async refresh(request: Request, response: Response, next: NextFunction) {
    try {
      if (!request.cookies["refresh_token"]) {
        response.status(401);
        return "forbidden";
      }
      const refresh_token = await RefreshToken.findOneOrFail(
        request.cookies["refresh_token"],
        { relations: ["user"] }
      );

      const { user } = refresh_token;

      // Check expiration
      const expires_at = new Date();
      expires_at.setTime(
        refresh_token.issued_at.getTime() + 24 * 60 * 30 * 60 * 1000
      );
      const current_time = new Date();
      if (current_time > expires_at) {
        response.status(401);
        return "forbidden";
      }

      const new_refresh_token = new RefreshToken();
      new_refresh_token.user = user;
      await new_refresh_token.save();

      const access_token = jwt.sign(
        { user_id: user.id, display_name: user.username },
        jwtConfig,
        {
          expiresIn: "2h",
          algorithm: "RS256",
        }
      );
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      response.cookie("refresh_token", new_refresh_token.id, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        expires,
      });

      return { access_token };
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        response.status(401);
      } else {
        console.error(e);
        response.status(500);
      }
      return "error";
    }
  }
}
