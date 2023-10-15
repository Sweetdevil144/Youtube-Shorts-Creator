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
  console.log("Fetching - 1");
  const videoId= req.body.url;
  console.log(`Video ID in app.js is : ${videoId}`);
  console.log(`Req.body in app.js is : ${req.body}`);
  console.log("Reques was ",req);
  try {
    console.log("Fetching - 2");
    const transcripts = await youtube.getVideoCaptions(videoId);
    console.log("Captions recieved. ", transcripts);
    const shorts = await fetchResults.extractShorts(transcripts); // added await here
    console.log("Shorts Extracted");
    console.log(shorts);
    return res.json({ success: true, shorts });
  } catch (error) {
    console.error("An Error occured -> " + error);
    return res.json({ success: false, error: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
