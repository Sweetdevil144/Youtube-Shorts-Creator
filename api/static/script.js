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
          console.log("Success");
          console.log(`data is ${JSON.stringify(data)}`);
          embedVideos(data.shorts, url);
        } else {
          console.log("An Error occurred in script.js in fetching shorts");
        }
      })
      .catch((error) => {
        console.log(`Error recieved in script.js -> \n ${error}`);
        console.error(error);
      });
  });
});

function embedVideos(shorts, videoId) {
  console.log("Going Good in embedVideos");
  const container = document.querySelector(".videos-container");
  container.innerHTML = "";
  shorts[0].data.forEach((short, index) => {
    const { start_time, end_time } = short;
    console.log("Start :" + start_time + " End: " + end_time);
    const embedCode = `<iframe allowFullScreen="allowFullScreen" 
                                        src="https://www.youtube.com/embed/${videoId}?ecver=1&amp;iv_load_policy=3&amp;rel=0&amp;showinfo=0&amp;yt:stretch=16:9&amp;autohide=1&amp;color=red&amp;start=${Math.round(
      start_time
    )}&amp;end=${end_time}&amp" 
                                        width="260" 
                                        height="140" 
                                        allowtransparency="true" 
                                        >
                                </iframe>`;
    container.innerHTML += embedCode;
  });
}