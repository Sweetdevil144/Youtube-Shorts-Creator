const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const fetchResults = require("./fetchresults");
const youtube = require("./youtube");

require("dotenv").config();
const app = express();

const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

app.use("/static", express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

app.post("/process_video", async (req, res) => {
  const videoId = req.body.url;
  try {
    const transcripts = await youtube.getVideoCaptions(videoId);
    const shorts = await fetchResults.extractShorts(transcripts.transcript);
    console.log(`shorts are \n ${JSON.stringify(shorts)}`);
    return res.json({ success: true, shorts });
  } catch (error) {
    console.log("Catched error in app.js");
    console.error("An Error occured -> " + error);
    return res.json({ success: false, error: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
