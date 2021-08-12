import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  description: { type: String, trim: true, maxLength: 80 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true, maxLength: 80 }],
  meta: {
    views: { type: Number, default: 0 },
    ratings: { type: Number, default: 0 },
  },
});

videoSchema.static("formatHashtags", (hashtags) =>
  hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`))
);

const videoModel = mongoose.model("Video", videoSchema);
export default videoModel;
