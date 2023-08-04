function loadVideos() {
    fetch('/list_videos')
        .then(response => response.json())
        .then(data => {
            const videosContainer = document.querySelector('.videos-container');
            videosContainer.innerHTML = ''; // Clear existing videos
            data.files.forEach(file => {
                const videoElement = document.createElement('video');
                videoElement.style.width = '200px';
                videoElement.style.height = '200px';
                videoElement.style.padding = '10px'
                const sourceElement = document.createElement('source');
                sourceElement.src = `/download/${file}`;
                sourceElement.type = 'video/mp4';
                videoElement.appendChild(sourceElement);
                videoElement.controls = true;
                videosContainer.appendChild(videoElement);
            });
        })
        .catch(error => {
            console.error(error);
        });
}

document.addEventListener('DOMContentLoaded', loadVideos);

document.getElementById('video-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const url = document.getElementById('url').value;
    fetch('/process_video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadVideos();
            } else {
                console.error(data.error || 'An error occurred.');
            }
        })
        .catch(error => {
            console.error(error);
        });
});
