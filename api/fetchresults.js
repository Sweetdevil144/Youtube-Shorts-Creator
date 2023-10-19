const axios = require("axios");

exports.extractShorts = async (captions) => {
  const chunks = divideCaptionsIntoChunks(captions, 15, 30, 35);
  const ratings = await Promise.all(
    chunks.map((chunk) => {
      const textChunk = chunk.map((caption) => caption.text).join(" ");
      return exports.analyzeCaptions(textChunk);
    }),
  );

  const chunksWithRatings = chunks.map((chunk, index) => {
    return {
      chunk: chunk,
      rating: ratings[index],
    };
  });

  chunksWithRatings.sort((a, b) => b.rating - a.rating);
  const topShorts = chunksWithRatings.slice(0, 3);
  const timestamps = topShorts.map(({ chunk }) => ({
    start: chunk[0].start,
    end: chunk[chunk.length - 1].start + chunk[chunk.length - 1].duration,
  }));

  console.log("timestamps:", timestamps);
  return timestamps;
};

exports.analyzeCaptions = async (text) => {
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
      },
    );

    if (response.data.choices && response.data.choices[0]) {
      const rating = response.data.choices[0].message.content.length;
      return rating;
    } else {
      console.warn("Unexpected API response:", response.data);
      return 0;
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return 0;
  }
};

function divideCaptionsIntoChunks(
  captions,
  minDuration,
  targetDuration,
  maxDuration,
) {
  let chunks = [];
  let currentChunk = [];
  let currentTime = 0;

  for (let caption of captions) {
    const nextTime = currentTime + caption.duration;
    if (
      (nextTime >= targetDuration && nextTime - currentTime >= minDuration) ||
      nextTime > maxDuration
    ) {
      chunks.push(currentChunk);
      currentChunk = [caption];
      currentTime = caption.duration;
    } else {
      currentChunk.push(caption);
      currentTime += caption.duration;
    }
  }

  if (currentChunk.length && currentTime >= minDuration) {
    chunks.push(currentChunk);
  }
  return chunks;
}
