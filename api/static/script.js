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
          embedVideos(data.shorts[0], url);
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

function embedVideos(data, videoId) {
  console.log("Going Good in embedVideos");
  const container = document.querySelector(".videos-container");
  container.innerHTML = "";

  console.log(
    `Shorts recieved in embedVideos is ${JSON.stringify(
      data.data,
    )} \n data length is ${data.data.length}`,
  );
  for (let i = 0; i < data.data.length; i++) {
    const { start_time, end_time, title } = data.data[i];
    console.log(
      "Start: " + start_time + " End: " + end_time + " Title: " + title,
    );
    const embedCode = `<iframe allowFullScreen="allowFullScreen" 
        src="https://www.youtube.com/embed/${videoId}?start=${Math.round(
          start_time,
        )}&end=${Math.round(end_time)}&autoplay=0&mute=1" 
        width="300" 
        height="200" 
        frameborder="0" 
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>`;
    container.innerHTML += embedCode;
  }
}
