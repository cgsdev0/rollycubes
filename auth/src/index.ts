import "reflect-metadata";
import { createConnection } from "typeorm";
import * as bcrypt from "bcrypt";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as csrf from "csurf";
import * as helmet from "helmet";
import { Request, Response } from "express";
import { Routes } from "./routes";
import { User } from "./entity/User";
import { PlayerStats } from "./entity/PlayerStats";
import { Achievement } from "./entity/Achievement";
import { UserToAchievement } from "./entity/UserToAchievement";

createConnection()
  .then(async (connection) => {
    // create express app
    const app = express();
    app.use(helmet());
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(csrf({ cookie: { httpOnly: true } }));

    app.get("/csrf", function (req, res) {
      res.send({ csrfToken: req.csrfToken() });
    });

    // register express routes from defined application routes
    Routes.forEach((route) => {
      (app as any)[route.method](
        route.route,
        (req: Request, res: Response, next: Function) => {
          const result = new (route.controller as any)()[route.action](
            req,
            res,
            next
          );
          if (result instanceof Promise) {
            result.then((result) =>
              result !== null && result !== undefined
                ? res.send(result)
                : undefined
            );
          } else if (result !== null && result !== undefined) {
            res.json(result);
          }
        }
      );
    });

    // setup express app here
    // ...

    // start express server
    app.listen(3031);

    const achievement = new Achievement();
    achievement.id = "astronaut:1";
    achievement.name = "Astronaut";
    achievement.description = "Win with a score of 100";
    await achievement.save();

    // insert new users for test
    const user = new User();
    user.hashed_password = await bcrypt.hash("admin", 10);
    user.username = "admin";
    await user.save();

    const stats = new PlayerStats();
    stats.user = user;
    await stats.save();

    const achievementAssignment = new UserToAchievement();
    achievementAssignment.achievement = achievement;
    achievementAssignment.unlocked = new Date();
    achievementAssignment.progress = 1;
    achievementAssignment.user = user;
    await achievementAssignment.save();

    console.log(
      "Express server has started on port 3031. Open http://localhost:3031/users to see results"
    );
  })
  .catch((error) => console.log(error));
