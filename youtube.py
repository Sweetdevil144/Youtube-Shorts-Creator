from apiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi
import youtube_dl
import subprocess

def get_video_captions(video_id):
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        return transcript_list
    except:
        print(f"An error occurred while fetching the transcript for the video with id {video_id}")
        return None

def download_video(video_id):
    output_path = f"{video_id}.mp4"
    ydl_opts = {'outtmpl': output_path}
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        ydl.download([f'https://www.youtube.com/watch?v={video_id}'])
    return output_path

def trim_video(start_time, duration, input_path, output_path):
    command = f"ffmpeg -ss {start_time} -i {input_path} -t {duration} -c:v copy -c:a copy {output_path}"
    subprocess.run(command, shell=True)
