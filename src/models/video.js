import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  fileURL: { type: String, required: true },
  title: { type: String, required: true, trim: true, maxLength: 80 },
  description: { type: String, trim: true, maxLength: 80 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true, maxLength: 80 }],
  meta: {
    views: { type: Number, default: 0 },
    ratings: { type: Number, default: 0 },
  },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

videoSchema.static("formatHashtags", (hashtags) =>
  hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`))
);

const videoDB = mongoose.model("Video", videoSchema);
export default videoDB;
