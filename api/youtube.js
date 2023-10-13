const axios = require('axios')
exports.getVideoCaptions = async (videoId) => {
  const API_KEY = process.env.Rapid_API_KEY
  console.log(`API-KEy is ${API_KEY}`);
  const options = {
    method: "GET",
    url: "https://subtitles-for-youtube1.p.rapidapi.com/GetTextsubtitles",
    params: {
      video_id: videoId,
    },
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": "subtitles-for-youtube1.p.rapidapi.com",
    },
  };

  try {
    console.log("Fetching Captions");
    const response = await axios.request(options);
    console.log("Fetched Captions");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
