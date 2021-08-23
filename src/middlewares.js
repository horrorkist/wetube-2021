import multer from "multer";

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
});
export const videoUpload = multer({
  dest: "uploads/videos/",
  limit: 1024 * 1024 * 10,
});
