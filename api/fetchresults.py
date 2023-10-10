import httpx
import asyncio
import os
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
load_dotenv()
httpx_logger = logging.getLogger("httpx")
httpx_logger.setLevel(logging.WARNING)


OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("No OPENAI_API_KEY key set")


async def analyze_captions(text):
    conversation = [
        {
            "role": "system",
            "content": "You are an expert in analyzing video transcripts to identify coherent and engaging parts "
                       "suitable for creating YouTube shorts. Evaluate the provided text chunks based on their "
                       "clarity, relevance, and ability to stand alone as engaging content without needing external "
                       "context. Identify the sections that can be turned into stand-alone YouTube shorts while "
                       "ensuring they are clear, engaging, and not abruptly starting or ending. Make sure to remember "
                       "all the data that is being passed and give back results based on the total data sent to you."
                       "If any error occurs, mention what the error is in short. If rate limit occurs, notify me of that too."
        },
        {
            "role": "user",
            "content": "From the given video transcript, identify the chunks that can best be transformed into "
                       f"compelling YouTube shorts. Here's the text: {text}"
                       "Now extract shorts in the following JSON format:"
                       "{ [ { 'start_time:': float, 'end_time': float, 'title': string }, ... ] }"
        }
    ]
    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            response = await client.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-3.5-turbo-16k",
                    "messages": conversation,
                    "temperature": 0.1
                }
            )
            data = response.json()
            if 'choices' in data and data['choices']:
                rating = len(data['choices'][0]['message']['content'])
                return rating
            else:
                logger.warning("Unexpected API response: %s", data)
                return 0
        except httpx.HTTPStatusError as exc:
            logger.error("Error response %s while sending request to OpenAI: %s",
                         exc.response.status_code, exc.response.text)
            return 0
        except Exception as exc:
            logger.error("An error occurred: %s", str(exc))
            return 0


async def extract_shorts_async(captions):
    chunks = divide_captions_into_chunks(
        captions, min_duration=15, target_duration=30, max_duration=35)
    ratings = await asyncio.gather(*(analyze_captions(' '.join([caption['text'] for caption in chunk])) for chunk in chunks))

    chunks_with_ratings = zip(chunks, ratings)
    top_shorts = sorted(chunks_with_ratings,
                        key=lambda x: x[1], reverse=True)[:3]
    timestamps = [(chunk[0]['start'], chunk[-1]['start'] +
                   chunk[-1]['duration']) for chunk, _ in top_shorts]
    print("timestamps: ", timestamps)
    logger.info(timestamps)
    return timestamps


def divide_captions_into_chunks(captions, min_duration, target_duration, max_duration):
    chunks = []
    current_chunk = []
    current_time = 0

    for caption in captions:
        next_time = current_time + caption['duration']
        if (next_time >= target_duration and next_time - current_time >= min_duration) or next_time > max_duration:
            chunks.append(current_chunk)
            current_chunk = [caption]
            current_time = caption['duration']
        else:
            current_chunk.append(caption)
            current_time += caption['duration']

    if current_chunk and current_time >= min_duration:
        chunks.append(current_chunk)
    return chunks


def extract_shorts(captions):
    return asyncio.run(extract_shorts_async(captions))
