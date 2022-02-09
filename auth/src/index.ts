import "reflect-metadata";
import { createConnection } from "typeorm";
import { verifyToken as userAuth } from "./middleware/auth";
import { verifyPreSharedKey as serverAuth } from "./middleware/server_auth";
import * as cors from "cors";
import * as bcrypt from "bcrypt";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as csrf from "csurf";
import * as helmet from "helmet";
import { Request, Response } from "express";
import { Routes } from "./routes";
import { ServerRoutes } from "./server_routes";
import { User } from "./entity/User";
import { PlayerStats } from "./entity/PlayerStats";
import { Achievement } from "./entity/Achievement";
import { UserToAchievement } from "./entity/UserToAchievement";
import { insertAchievementList } from "./achievements";

createConnection()
  .then(async (connection) => {
    const app = express();
    app.use(helmet());
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(
      cors({
        origin: "https://rollycubes.live",
        credentials: true,
        allowedHeaders: ["csrf-token", "content-type", "x-access-token"],
      })
    );
    app.get("/twitch", function (req, res) {
      const redirect = req.param("redirect", "");
      if (!redirect)
        return res.status(400).send("please include a redirect url");
      const dest =
        `https://id.twitch.tv/oauth2/authorize` +
        `?client_id=${process.env.TWITCH_CLIENT_ID}` +
        `&redirect_uri=${redirect}` +
        `&response_type=token`;
      res.redirect(302, dest);
    });
    const csurf = csrf({
      cookie: { httpOnly: true, sameSite: "none", secure: true },
    });
    app.get("/csrf", csurf, function (req, res) {
      res.send({ csrfToken: req.csrfToken() });
    });

    // register express routes from defined application routes
    const registerRoute = (middlewares) => (route) => {
      const middleware = [...middlewares];
      if (route.requires_auth) {
        middleware.push(userAuth);
      }
      (app as any)[route.method](
        route.route,
        ...middleware,
        (req: Request, res: Response, next: Function) => {
          const result = new (route.controller as any)()[route.action](
            req,
            res,
            next
          );
          if (result instanceof Promise) {
            result
              .then((result) =>
                result !== null && result !== undefined
                  ? res.send(result)
                  : res.send(null)
              )
              .catch((reason) =>
                res.send(reason.message || "something went wrong")
              );
          } else if (result !== null && result !== undefined) {
            res.json(result);
          }
        }
      );
    };

    Routes.forEach(registerRoute([csurf]));
    ServerRoutes.forEach(registerRoute([serverAuth]));
    // start express server
    app.listen(3031);

    await insertAchievementList();

    // // insert new users for test
    // const user = new User();
    // user.hashed_password = await bcrypt.hash("admin", 10);
    // user.username = "admin";
    // user.image_url =
    //   "https://avatars.githubusercontent.com/u/4583705?s=400&u=f59c42dd30e407689861661295c37de67a4f5032&v=4";
    // await user.save();

    // const stats = new PlayerStats();
    // stats.user = user;
    // await stats.save();

    // const achievementAssignment = new UserToAchievement();
    // achievementAssignment.achievement = await Achievement.findOneOrFail(
    //   "astronaut:1"
    // );
    // achievementAssignment.unlocked = new Date();
    // achievementAssignment.progress = 1;
    // achievementAssignment.user = user;
    // await achievementAssignment.save();

    console.log(
      "Express server has started on port 3031. Open http://localhost:3031/users to see results"
    );
  })
  .catch((error) => console.log(error));
