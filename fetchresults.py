import openai
import httpx
import asyncio
from api_keys import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY


async def analyze_captions(text):
    conversation = [
        {
            "role": "system",
            "content": "You are an expert in analyzing video transcripts to identify coherent and engaging parts "
                       "suitable for creating YouTube shorts. Evaluate the provided text chunks based on their "
                       "clarity, relevance, and ability to stand alone as engaging content without needing external "
                       "context. Identify the sections that can be turned into stand-alone YouTube shorts while "
                       "ensuring they are clear, engaging, and not abruptly starting or ending."
            # For a given chunk, specify the video content in that video only if context is not available.
            # XwUtZMfl0pk
        },
        {
            "role": "user",
            "content": "From the given video transcript, identify the chunks that can best be transformed into "
                       f"compelling YouTube shorts. Here's the text: {text}"
        }
    ]
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gpt-4",
                "messages": conversation,
                "temperature": 0.1
            }
        )
        data = response.json()
        print("OpenAI API Response:", data)
        rating = len(data['choices'][0]['message']['content'])
        return rating


async def extract_shorts_async(captions):
    chunks = divide_captions_into_chunks(captions, min_duration=15, target_duration=30, max_duration=35)
    ratings = await asyncio.gather(*(analyze_captions(' '.join([caption['text'] for caption in chunk])) for chunk in chunks))

    chunks_with_ratings = zip(chunks, ratings)
    top_shorts = sorted(chunks_with_ratings, key=lambda x: x[1], reverse=True)[:3]
    timestamps = [(chunk[0]['start'], chunk[-1]['start'] + chunk[-1]['duration']) for chunk, _ in top_shorts]
    print("timestamps: ", timestamps)
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