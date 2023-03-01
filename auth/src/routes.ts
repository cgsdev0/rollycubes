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
    method: "post",
    route: "/twitch_login_or_register",
    controller: UserController,
    action: "twitch_oauth",
  },
  {
    method: "get",
    route: "/public_key",
    controller: UserController,
    action: "pubkey",
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
    route: "/logout",
    controller: UserController,
    action: "logout",
    requires_auth: true,
  },
  // Disable user registration and login (twitch only for now)
  // {
  //   method: "post",
  //   route: "/register",
  //   controller: UserController,
  //   action: "register",
  // },
  // {
  //   method: "post",
  //   route: "/login",
  //   controller: UserController,
  //   action: "login",
  // },
  {
    method: "get",
    route: "/refresh_token",
    controller: UserController,
    action: "refresh",
  },
];
