import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: preocess.env.AWS_SECRET,
  },
});

const multerUploader = multerS3({
  s3: s3,
  bucket: "wetube-horrorkist",
});

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.user = req.session.user ? req.session.user : {};
  next();
};

export const protectMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  }
  req.flash("error", "You need to login first.");
  return res.redirect("/");
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  }
  req.flash("error", "Not Authorized");
  return res.redirect("/");
};

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limit: 1024 * 1024 * 3,
  storage: multerUploader,
});
export const videoUpload = multer({
  dest: "uploads/videos/",
  limit: 1024 * 1024 * 10,
  storage: multerUploader,
});
