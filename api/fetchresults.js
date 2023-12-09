const axios = require("axios");
const TOKEN_LIMIT = 128000;
exports.extractShorts = async (captions) => {
  const chunks = divideCaptionsIntoChunks(captions);
  let allShorts = []; // Array to hold all shorts from all chunks
  for (const chunk of chunks) {
    const shortsFromChunk = await analyzeCaptions(JSON.stringify(chunk));
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
        "You are an expert in analyzing video transcripts from end to end to identify coherent and engaging parts suitable for creating YouTube shorts. Evaluate the provided text chunks based on their clarity, relevance, and ability to stand alone as engaging content without needing external context. Identify the sections that can be turned into stand-alone YouTube shorts while ensuring they are clear, engaging, and not abruptly starting or ending. Make sure to remember all the daathat is being passed and give back results based on the total data sent to you. Make sure to not give anything other other message than that specified in user roles.",
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
      However. Using the provided timing, convert that necessarily into seconds when returning output. For example, 2:28 is 2 minutes and 28 seconds, which is 148 seconds so return 148 instead of 2.28. The length of a clip extracted should lie in 15 seconds to 25 seconds.
      The content of video lies in provided captions, whereas the corresponding timings lie in the given start_time. Make sure to analyze complete transcript and give shorts on that data's basis rather than only utilising the beginning of the transcript.
      `,
    },
  ];

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-1106-preview",
        messages: conversation,
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.choices && response.data.choices[0]) {
      // Extracting the JSON string from the response
      let content = response.data.choices[0].message.content;
      let jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

      if (jsonMatch && jsonMatch[1]) {
        // Parsing the extracted JSON string
        let parsedJson = JSON.parse(jsonMatch[1]);
        console.log("Parsed JSON is", parsedJson);
        return parsedJson;
      } else {
        console.warn("No JSON data found in response");
        return null;
      }
    } else {
      console.warn("Unexpected API response:", response.data);
      return null;
    }
  } catch (error) {
    console.log("Caught error");
    console.error("An error occurred in fetchresults.analyzeCaptions:", error);
    return null;
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
