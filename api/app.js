const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors"); // Require the CORS package

const fetchResults = require("./fetchresults");
const youtube = require("./youtube");

require("dotenv").config();
const app = express();

const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors()); // Use the CORS middleware

app.use("/static", express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

app.post("/process_video", async (req, res) => {
  const videoId = req.body.url;
  try {
    const transcripts = await youtube.getVideoCaptions(videoId);
    console.log("transcript fetched");
    const shorts = await fetchResults.extractShorts(transcripts.transcript);
    console.log('\n\n Shorts are :', shorts);
    return res.json({ success: true, shorts });
  } catch (error) {
    console.log("Caught error in app.js");
    console.error("An Error occurred -> " + error);
    return res.json({ success: false, error: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
