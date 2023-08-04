import os
from flask import Flask, render_template, request, jsonify, send_from_directory
import yt_dlp as youtube_dl
from moviepy.video.io.VideoFileClip import VideoFileClip
import youtube
import fetchresults

app = Flask(__name__)

DOWNLOAD_FOLDER = os.path.join(os.getcwd(), 'download')

def download_video(url, output_path):
    ydl_opts = {'format': 'best', 'outtmpl': output_path}
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

def extract_segment(input_filename, start_time, end_time, output_filename):
    with VideoFileClip(input_filename) as video:
        new_video = video.subclip(start_time, end_time)
        new_video.write_videofile(output_filename, codec="libx264")

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/process_video', methods=['POST'])
def process_video():
    url = request.json['url']
    video_id = url.split("v=")[-1]
    captions = youtube.get_video_captions(video_id)
    if captions is None:
        return jsonify({"error": "Unable to fetch captions."}), 400

    start_and_end_timing = fetchresults.extract_shorts(captions)
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    temp_filename = os.path.join(os.getcwd(), "temp_video.mp4")
    download_video(video_url, temp_filename)

    output_files = []
    for i, (start_time, end_time) in enumerate(start_and_end_timing):
        output_filename = os.path.join(DOWNLOAD_FOLDER, f"short_{i}.mp4")
        extract_segment(temp_filename, start_time, end_time, output_filename)
        output_files.append(output_filename)

    relative_output_files = [os.path.join('download', os.path.basename(output_file)) for output_file in output_files]
    return jsonify({"success": True, "files": relative_output_files})
@app.route('/list_videos')
def list_videos():
    files = [f for f in os.listdir(DOWNLOAD_FOLDER) if os.path.isfile(os.path.join(DOWNLOAD_FOLDER, f))]
    return jsonify({"files": files})

@app.route('/download/<path:filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(DOWNLOAD_FOLDER, filename, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)