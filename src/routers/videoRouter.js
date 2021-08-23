import express from "express";
import {
  watch,
  getUpload,
  getEditVideo,
  postEditVideo,
  postUpload,
  getDeleteVideo,
} from "../controllers/videoController";
import { protectMiddleware, videoUpload } from "../middlewares";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .get(getEditVideo)
  .post(postEditVideo);
videoRouter.route("/:id([0-9a-f]{24})/delete").get(getDeleteVideo);
videoRouter
  .route("/upload")
  .all(protectMiddleware)
  .get(getUpload)
  .post(videoUpload.single("video"), postUpload);

export default videoRouter;
