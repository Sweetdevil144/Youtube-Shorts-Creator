from flask import Flask, render_template, request, jsonify
import fetchresults
import youtube  # make sure this is your youtube.py file

app = Flask(__name__)


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

    formatted_start_end = [{'start': round(s), 'end': round(e)} for s, e in start_and_end_timing]

    return jsonify({"success": True, "shorts": formatted_start_end})


if __name__ == "__main__":
    app.run(debug=True)
