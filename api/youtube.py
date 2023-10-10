from youtube_transcript_api import YouTubeTranscriptApi


def get_video_captions(video_id):
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        print("Transcript length", len(transcript_list))
        print(transcript_list)
        return transcript_list
    except:
        print(f"An error occurred while fetching the transcript for the video with id {video_id}")
        return None
