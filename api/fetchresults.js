const axios = require("axios");
const TOKEN_LIMIT = 60000;
exports.extractShorts = async (captions) => {
  const chunks = divideCaptionsIntoChunks(captions);
  const shorts = [];

  for (const chunk of chunks) {
    const short = await analyzeCaptions(JSON.stringify(chunk));
    shorts.push(short);
  }
  return shorts;
};

const analyzeCaptions = async (text) => {
  console.log("Analyzing captions in fetchresults.analyzeCaptions");
  const conversation = [
    {
      role: "system",
      content:
        "You are an expert in analyzing video transcripts to identify coherent and engaging parts suitable for creating YouTube shorts. Evaluate the provided text chunks based on their clarity, relevance, and ability to stand alone as engaging content without needing external context. Identify the sections that can be turned into stand-alone YouTube shorts while ensuring they are clear, engaging, and not abruptly starting or ending. Make sure to remember all the daathat is being passed and give back results based on the total data sent to you. If any error occurs, mention what the error is. If you are unable to process the given video transcript at the moment, give a deatiled message why is it so ",
    },
    {
      role: "user",
      content: `From the given video transcript, identify the chunks that can best be transformed into compelling YouTube shorts and extract only 3 high quality shorts from this. Here's the text: ${text} Now extract shorts strictly in the following JSON format: {
        "data": [
          {
            "start_time": start_time,
            "end_time": end_time,
            "title": title (in string)
          },
          // rest of objects
        ]
      } The start and end timings are provided in minutes.
      However. Using the provided timing, convert that necessarily into seconds when returning output. For example, 2:28 is 2 minutes and 28 seconds, which is 148 seconds so return 148 instead of 2.28. One more necessary condition should be that the extracted short time should lie between 15-20 seconds.
      The difference between start_time and end_time should necessarily lie between 12 to 23 seconds. The content of video lies in provided captions, whereas the corresponding timings lie in the given start_time
      `,
    },
  ];

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo-16k",
        messages: conversation,
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.choices && response.data.choices[0]) {
      console.log(
        "response.data.choices[0].message.content is",
        JSON.parse(response.data.choices[0].message.content)
      );
      return JSON.parse(response.data.choices[0].message.content);
    } else {
      console.warn("Unexpected API response:", response.data);
      return 0;
    }
  } catch (error) {
    console.log("Catched error");
    console.error("An error occurred in fetchresults.analyzeCaptions:", error);
    return 0;
  }
};

const divideCaptionsIntoChunks = (captions) => {
  let chunks = [];
  let currentChunk = [];
  let currentCharCount = 0;

  for (let caption of captions) {
    let snippetCharCount = caption.snippet.length;
    if (currentCharCount + snippetCharCount > TOKEN_LIMIT) {
      chunks.push(currentChunk);
      currentChunk = [caption];
      currentCharCount = snippetCharCount;
    } else {
      currentChunk.push(caption);
      currentCharCount += snippetCharCount;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
};
