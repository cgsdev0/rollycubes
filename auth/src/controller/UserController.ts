import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import { getConnection } from "typeorm";
import { User } from "../entity/User";
import { PlayerStats } from "../entity/PlayerStats";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { RefreshToken } from "../entity/RefreshToken";
import { EntityNotFoundError } from "typeorm";
import * as fs from "fs";
import { publicKey } from "../middleware/auth";
import { UserToAchievement } from "../entity/UserToAchievement";
import { Achievement } from "../entity/Achievement";
import { TwitchIdentity } from "../entity/TwitchIdentity";
import { TWITCH_CLIENT_ID } from "../twitch";

const jwtConfig = {
  key: fs.readFileSync("./secrets/.id"),
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

  async achievementProgress(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    if (
      !request.body.user_id ||
      !request.body.achievement_id ||
      !request.body.progress
    ) {
      throw new Error("no id specified");
    }

    const { user_id, achievement_id, progress } = request.body;
    if (progress <= 0) return "nothing todo";

    let a = await UserToAchievement.findOne({
      where: { user: { id: user_id }, achievement: { id: achievement_id } },
      relations: ["achievement", "user"],
    });
    if (!a) {
      a = new UserToAchievement();
      a.achievement = await Achievement.findOneOrFail(achievement_id);
      a.user = await User.findOneOrFail(user_id);
      a.progress = 0;
    }
    if (a.unlocked) return "already unlocked!";

    a.progress += progress;
    // Check if they completed the achievement
    if (a.achievement.max_progress <= a.progress) {
      a.unlocked = new Date();
    }
    await a.save();
    if (!a.achievement.image_url) {
      a.achievement.image_url = "//via.placeholder.com/48";
    }
    if (a.unlocked)
      return Object.assign({ type: "achievement_unlock" }, a.achievement);
    return "ok";
  }

  async addStats(request: Request, response: Response, next: NextFunction) {
    if (!request.body.id) {
      throw new Error("no id specified");
    }

    let stats = await PlayerStats.findOne(request.body.id);
    if (!stats) {
      stats = new PlayerStats();
      stats.rolls = 0;
      stats.wins = 0;
      stats.games = 0;
      stats.doubles = 0;
    }
    stats.user = new User();
    stats.user.id = request.body.id;
    const { rolls, wins, games, doubles } = request.body;
    stats.rolls += rolls || 0;
    stats.wins += wins || 0;
    stats.games += games || 0;
    stats.doubles += doubles || 0;
    await stats.save();
    return "done";
  }

  async me(request: Request, response: Response, next: NextFunction) {
    return User.findOne(response.locals.user.user_id, {
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
      response.status(400);
      return "That username is already taken.";
    }
  }

  async login_helper(user: User, response: Response) {
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

  async twitch_oauth(request: Request, response: Response, next: NextFunction) {
    const { twitch_access_token } = request.body;
    // Validate access token against twitch
    const resp = await fetch("https://id.twitch.tv/oauth2/validate", {
      headers: { Authorization: "Bearer " + twitch_access_token },
    });
    const twitchTokenData = await resp.json();
    const { client_id, login, user_id } = twitchTokenData;
    if (client_id !== TWITCH_CLIENT_ID) {
      response.status(400);
      console.error(twitchTokenData);
      return "client id mismatch";
    }
    let twitchId = await TwitchIdentity.findOne(user_id, {
      relations: ["user"],
    });
    if (!twitchId) {
      // registration flow

      // Ask twitch for user details
      const userDataResp = await fetch(
        "https://api.twitch.tv/helix/users?id=" + user_id,
        {
          headers: {
            Authorization: "Bearer " + twitch_access_token,
            "Client-Id": client_id,
          },
        }
      );
      const { data } = await userDataResp.json();
      const [twitchUserData] = data;
      const user = new User();
      user.username = twitchUserData.display_name;
      user.image_url = twitchUserData.profile_image_url;
      user.hashed_password = "";
      twitchId = new TwitchIdentity();
      twitchId.twitch_id = user_id;
      twitchId.twitch_login = login;
      await twitchId.save();
      user.twitch = twitchId;
      await user.save();
      twitchId.user = user;
    }
    // login flow
    return await this.login_helper(twitchId.user, response);
  }

  async login(request: Request, response: Response, next: NextFunction) {
    try {
      const user = await User.findOneOrFail({
        select: ["hashed_password", "username", "id"],
        where: { username: request.body.username },
      });

      if (await bcrypt.compare(request.body.password, user.hashed_password)) {
        return await this.login_helper(user, response);
      }
      response.status(401);
      return "forbidden";
    } catch (e) {
      response.status(500);
      console.error(e);
      return "error";
    }
  }

  async logout(request: Request, response: Response, next: NextFunction) {
    try {
      if (request.cookies["refresh_token"]) {
        response.clearCookie("refresh_token");
        const refresh_token = await RefreshToken.findOneOrFail(
          request.cookies["refresh_token"]
        );
        await refresh_token.remove();
      }
    } catch (e) {
      // ehh
    }
    return "ok";
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
