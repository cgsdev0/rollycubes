import { UserController } from "./controller/UserController";

interface Route {
  method: "get" | "post";
  route: string;
  controller: any;
  action: string;
}

export const ServerRoutes: Route[] = [
  {
    method: "post",
    route: "/add_stats",
    controller: UserController,
    action: "addStats",
  },
  {
    method: "post",
    route: "/achievement_progress",
    controller: UserController,
    action: "achievementProgress",
  },
];
