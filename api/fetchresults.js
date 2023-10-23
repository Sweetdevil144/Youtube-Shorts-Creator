const axios = require("axios");

exports.extractShorts = async (captions) => {
  console.log(`captions length is \n ${captions.length}`);
  const chunks = divideCaptionsIntoChunks(captions);

  const shorts = [];

  for (const chunk of chunks) {
    const short = await analyzeCaptions(chunk);
    shorts.push(short);
    console.log(`Shorts after analyzeCaptions are ${shorts}`);
  }
  console.log(`Shorts array in extractShorts is ${shorts}`);
  return shorts;
};

const analyzeCaptions = async (text) => {
  // console.log("Text passed in analyzeCaptions is", text);
  console.log("Analyzing captions in fetchresults.analyzeCaptions");
  const conversation = [
    {
      role: "system",
      content:
        "You are an expert in analyzing video transcripts to identify coherent and engaging parts suitable for creating YouTube shorts. Evaluate the provided text chunks based on their clarity, relevance, and ability to stand alone as engaging content without needing external context. Identify the sections that can be turned into stand-alone YouTube shorts while ensuring they are clear, engaging, and not abruptly starting or ending. Make sure to remember all the data that is being passed and give back results based on the total data sent to you. If any error occurs, mention what the error is in short. If rate limit occurs, notify me of that too.",
    },
    {
      role: "user",
      content: `From the given video transcript, identify the chunks that can best be transformed into compelling YouTube shorts. Here's the text: ${text} Now extract shorts in the following JSON format: { [ { 'start_time:': float, 'end_time': float, 'title': string }, ... ] }`,
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
      console.log("response.data is", JSON.stringify(response.data, null, 2));
      console.log(
        "response.data.choices[0].message.content is",
        JSON.parse(response.data.choices[0].message.content)
      );
      return response.data.choices[0];
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
  let currentChunk = "";
  let tokenCount = 0;

  for (let caption of captions) {
    if (tokenCount < 12000) {
      currentChunk += caption.snippet;
      tokenCount += 30;
    } else {
      chunks.push(currentChunk);
      currentChunk = caption.snippet;
      tokenCount = 30;
    }
  }
  console.log(`chunks.length is ${chunks.length}`);
  chunks.push(currentChunk);
  return chunks;
};
