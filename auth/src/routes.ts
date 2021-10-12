import { UserController } from "./controller/UserController";

interface Route {
  method: "get" | "post";
  route: string;
  controller: any;
  action: string;
  requires_auth?: boolean;
}

export const Routes: Route[] = [
  {
    method: "get",
    route: "/users",
    controller: UserController,
    action: "all",
  },
  {
    method: "get",
    route: "/users/:id",
    controller: UserController,
    action: "one",
  },
  {
    method: "get",
    route: "/me",
    controller: UserController,
    action: "me",
    requires_auth: true,
  },
  {
    method: "post",
    route: "/register",
    controller: UserController,
    action: "register",
  },
  {
    method: "post",
    route: "/login",
    controller: UserController,
    action: "login",
  },
  {
    method: "get",
    route: "/refresh_token",
    controller: UserController,
    action: "refresh",
  },
];
