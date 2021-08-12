import "dotenv/config";
import "./db.js";
import "./models/video.js";
import "./models/user.js";
import app from "./index";

app.listen(4000, () => console.log("Server Listening on Port: 4000"));
