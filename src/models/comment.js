import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  video: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
  postedAt: { type: Date, required: true, default: Date.now },
  isEdited: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  likedUserList: [{ type: mongoose.Schema.Types.ObjectId }],
});

const commentDB = mongoose.model("Comment", commentSchema);
export default commentDB;
