import express from "express";
import {
  edit,
  remove,
  getLogout,
  startGithubLogin,
  finishGithubLogin,
  successGithubLogin,
} from "../controllers/userController";

const userRouter = express.Router();

userRouter.get("/github/start", startGithubLogin);
userRouter.get("/github/finish", finishGithubLogin);
userRouter.get("/github/logged_in", successGithubLogin);
userRouter.get("/edit", edit);
userRouter.get("/logout", getLogout);

export default userRouter;
