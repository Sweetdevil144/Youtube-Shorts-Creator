document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("video-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const url = document.getElementById("url").value;

    fetch("/process_video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Video Id is : " + url);
          console.log("Shorts are : " + JSON.parse(data.shorts));
          embedVideos(data.shorts, youtube.extractVideoId(url)); // Assuming a function to extract videoId is available
        } else {
          console.log("An Error occurred in script.js in fetching shorts");
        }
      })
      .catch((error) => {
        console.log(`Error recieved in script.js -> \n ${error}`)
        console.error(error);
      });
  });
});

function embedVideos(shorts, videoId) {
  console.log("Shorts " + shorts);
  console.log("Going Good");
  console.log("Extracted Video ID: ", videoId);
  const container = document.querySelector(".videos-container");
  container.innerHTML = "";
  shorts.forEach((short, index) => {
    const { start, end } = short;
    console.log("Start :" + start + " End: " + end);
    const embedCode = `<iframe allowFullScreen="allowFullScreen" 
                                        src="https://www.youtube.com/embed/${videoId}?ecver=1&amp;iv_load_policy=3&amp;rel=0&amp;showinfo=0&amp;yt:stretch=16:9&amp;autohide=1&amp;color=red&amp;start=${Math.round(
                                          start,
                                        )}&amp;end=${Math.round(end)}&amp" 
                                        width="260" 
                                        height="140" 
                                        allowtransparency="true" 
                                        >
                                </iframe>`;
    container.innerHTML += embedCode;
  });
}
