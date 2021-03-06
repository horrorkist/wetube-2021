import videoDB from "../models/video.js";
import userDB from "../models/user";
import commentDB from "../models/comment";

export const home = async (req, res) => {
  const videos = await videoDB
    .find({}, (error, videos) => {})
    .populate("owner");
  res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await videoDB
    .findById(id)
    .populate("owner")
    .populate("comments");
  res.render("watch", {
    pageTitle: video.title,
    video,
  });
};

export const getEditVideo = async (req, res) => {
  const { id } = req.params;
  const video = await videoDB.findById(id);
  const _id = req.session.user._id;
  if (!video) {
    return res.render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner._id) !== String(_id)) {
    return res.status(403).redirect("/search");
  }
  return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};

export const postEditVideo = async (req, res) => {
  const { id } = req.params;
  const { newTitle, newDescription, newHashtags } = req.body;
  const { user: _id } = req.session;
  const video = await videoDB.exists({ _id: id });
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner._id) !== String(_id)) {
    res.status(403).redirect("/");
  }
  await videoDB.findByIdAndUpdate(id, {
    title: newTitle,
    description: newDescription,
    hashtags: videoDB.formatHashtags(newHashtags),
  });
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload a new video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { location: fileURL } = req.file;
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await videoDB.create({
      fileURL,
      title,
      description,
      hashtags: videoDB.formatHashtags(hashtags),
      owner: _id,
    });
    const user = await userDB.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const getDeleteVideo = async (req, res) => {
  const { id } = req.params;
  const _id = req.session.user._id;
  const video = await videoDB.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner._id) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await videoDB.findByIdAndDelete(id);
  return res.redirect("/");
};

export const getSearch = async (req, res) => {
  const { keyword } = req.query;
  if (keyword) {
    const videos = await videoDB
      .find({
        title: {
          $regex: new RegExp(keyword, "i"),
        },
      })
      .populate("owner");
    return res.render("search", { pageTitle: "Search", videos });
  }
  return res.render("search", { pageTitle: "Search" });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await videoDB.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views += 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  const newComment = await commentDB.create({
    text,
    owner: user._id,
    video: id,
  });
  const video = await videoDB.findById(id);
  video.comments.push(newComment);
  await video.save();
  const owner = await userDB.findById(user._id);
  owner.comments.push(newComment);
  await owner.save();
  return res.status(201).json({ newCommentId: newComment._id });
};

export const deleteComment = async (req, res) => {
  const {
    session: { user },
    params: { id },
  } = req;
  const comment = await commentDB
    .findByIdAndDelete(id)
    .populate("owner")
    .populate("video");
  await userDB.findOneAndUpdate(
    { _id: comment.owner },
    { $pullAll: { comments: [comment.id] } }
  );
  await videoDB.findOneAndUpdate(
    { _id: comment.video },
    { $pullAll: { comments: [comment.id] } }
  );
  return res.status(200).end();
};
