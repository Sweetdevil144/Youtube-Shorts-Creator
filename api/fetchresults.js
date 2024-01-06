const axios = require("axios");
const { response } = require("express");
const TOKEN_LIMIT = 32000;
exports.extractShorts = async (captions) => {
  const chunks = divideCaptionsIntoChunks(captions);
  let allShorts = []; // Array to hold all shorts from all chunks
  console.log(chunks.length);
  for (const chunk of chunks) {
    const shortsFromChunk = await analyzeCaptions(chunk);
    // Combine the shorts from this chunk into the main array
    allShorts = allShorts.concat(shortsFromChunk);
  }
  console.log(allShorts);
  return allShorts;
};

const analyzeCaptions = async (text) => {
  console.log("Analyzing captions in fetchresults.analyzeCaptions");
  const conversation = [
  {
    role: "system",
    content:
      "Your task is to analyze video transcripts and identify segments suitable for creating short video clips. Focus on the clarity, relevance, and standalone value of each segment. Each identified segment should be clear, engaging, and have a well-defined start and end, without abrupt transitions.",
  },
  {
    role: "user",
    content: `Analyze the provided video transcript and identify segments that can be transformed into compelling short video clips. Extract up to 3 high-quality segments. Here's the transcript: ${text}. Please provide the segments in the following JSON format: {
      "data": [
        {
          "start_time": [start in seconds],
          "end_time": [end in seconds],
          "title": [title of the segment]
        }
      ]
    } Note: The start and end times should be provided in total seconds (not minutes or mixed formats). Each segment should be between 15 to 25 seconds long. Analyze the entire transcript to identify the best segments.`
  },
];

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        // model: "gpt-4-1106-preview",
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
      // Extracting the JSON string from the response
      let content = response.data.choices[0].message.content;
      let jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

      if (jsonMatch && jsonMatch[1]) {
        // Parsing the extracted JSON string
        let parsedJson = JSON.parse(jsonMatch[1]);
        console.log("Parsed Content is", content);
        return parsedJson;
      } else {
        console.warn("No JSON data found in response");
        console.log(content);
        return JSON.parse(content);
      }
    } else {
      console.warn("Unexpected API response:", content);
      return null;
    }
  } catch (error) {
    console.log("Caught error");
    console.error("An error occurred in fetchresults.analyzeCaptions: \n ", error.response.status);
    console.error(error.response.data);
    return null;
  }
};

const divideCaptionsIntoChunks = (captions) => {
  let chunks = [];
  let currentChunk = [];
  let currentCharCount = 0;

  for (let caption of captions) {
    // Check if snippet is null and handle it appropriately
    let snippetCharCount = caption.snippet ? caption.snippet.length : 0;

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
