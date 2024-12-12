import passport from "passport";
import { UserAuthController } from "@src/controller/user-auth.controller";
import { GetnewToken } from "@src/middleware/setnewtoken.middleware";
import { Router } from "express";

export const AppRouter = Router();

AppRouter.route("/signup").post(UserAuthController.UserSignup);
AppRouter.route("/signin").post(UserAuthController.UserSignin);

// PROTECTED ROUTES
AppRouter.route("/user").get(
  GetnewToken,
  passport.authenticate("jwt", { session: false }),
  UserAuthController.GetUserProfile
);
