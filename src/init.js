import "regenerator-runtime";
import "dotenv/config";
import "./db.js";
import "./models/video.js";
import "./models/user.js";
import app from "./index";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log("Server Listening on Port: 4000"));
