const axios = require("axios");

exports.getVideoCaptions = async (Id) => {
  console.log(`Video ID provided in youtube.js is ${Id}`);
  const API_KEY = process.env.Rapid_API_KEY;
  console.log(`API-Key is ${API_KEY}`);

  const options = {
    method: "POST",
    url: "https://youtube-scraper-2023.p.rapidapi.com/video_transcript",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": "youtube-scraper-2023.p.rapidapi.com",
    },
    data: {
      videoId: Id,
    },
  };

  try {
    const response = await axios(options);
    const captions = response.data;
    return captions;
  } catch (error) {
    console.log("Error");
    console.error(error.response ? error.response.data : error.message);
  }
};
