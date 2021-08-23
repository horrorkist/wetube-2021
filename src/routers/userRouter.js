import express from "express";
import {
  edit,
  remove,
  getLogout,
  startGithubLogin,
  finishGithubLogin,
  successGithubLogin,
  getEditProfile,
  postEditProfile,
  getChangePassword,
  postChangePassword,
  getUserProfile,
} from "../controllers/userController";
import {
  publicOnlyMiddleware,
  protectMiddleware,
  avatarUpload,
} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/github/logged_in", protectMiddleware, successGithubLogin);
userRouter
  .route("/edit-profile")
  .all(protectMiddleware)
  .get(getEditProfile)
  .post(avatarUpload.single("avatar"), postEditProfile);
userRouter
  .route("/change-password")
  .all(protectMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get("/logout", protectMiddleware, getLogout);
userRouter.get("/:id([0-9a-f]{24})", getUserProfile);

export default userRouter;
