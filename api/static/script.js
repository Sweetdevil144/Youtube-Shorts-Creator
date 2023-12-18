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
        console.log(data);
        if (data.success) {
          console.log("Success");
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
  const container = document.querySelector(".videos-container");
  container.innerHTML = "";

  shorts.forEach(chunk => {
    if (chunk && chunk.data) {
      chunk.data.forEach(({ start_time, end_time, title }) => {
        console.log("Start:", start_time, "End:", end_time, "Title:", title);
        const embedCode = `<iframe allowFullScreen="allowFullScreen"
          src="https://www.youtube.com/embed/${videoId}?start=${Math.round(start_time)}&end=${Math.round(end_time)}&autoplay=0&mute=1"
          width="300" 
          height="200" 
          frameborder="0" 
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>`;
        container.innerHTML += embedCode;
      });
    }
  });
}
