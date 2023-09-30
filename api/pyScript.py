import sys
import json
import api.youtube as youtube
import api.fetchresults as fetchresults

def main(video_id):
    captions = youtube.get_video_captions(video_id)
    if captions is None:
        print(json.dumps({"error": "Unable to fetch captions."}))
        sys.exit(1)
    
    start_and_end_timing = fetchresults.extract_shorts(captions)
    formatted_start_end = [{'start': round(s), 'end': round(e)} for s, e in start_and_end_timing]

    print(json.dumps({"success": True, "shorts": formatted_start_end}))

if __name__ == "__main__":
    video_id = sys.argv[1]  # get the command-line argument
    main(video_id)
