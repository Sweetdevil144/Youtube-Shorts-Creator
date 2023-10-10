const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { spawn } = require("child_process");
const { log } = require("console");

require("dotenv").config();
const app = express();

const PORT = process.env.PORT;
const apiKey = process.env.OPENAI_API_KEY;
app.use(bodyParser.json());

app.use("/static", express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

app.post("/process_video", (req, res) => {
  const { url } = req.body;

  const scriptPath = path.join(__dirname, "pyScript.py");
  const python = spawn("python3", [scriptPath, url]);

  python.stdout.on("data", (data) => {
    console.log(`Python Output of stdout: ${data}`);
  });

  python.stderr.on("data", (data) => {
    console.log(`Python Output of stdrr: ${data}`);
    if (!res.headersSent) {
      res.json({ success: false, error: data.toString() });
    }
  });
});

app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
