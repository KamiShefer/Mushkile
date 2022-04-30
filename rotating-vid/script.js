const VIDEOS_PER_ROUND = 3;
const VIDEO_LOCATION = String.raw`file://c:\code\rotating-vid\vids`;
const VIDEOS_PER_CATEGORY = 3;
const AMOUNT_OF_CATEGORIES = 5;

function getVideoNumber(index) {
    // Videos start from 1 to VIDEOS_PER_CATEGORY
    // NOTE - temporarily, only 2 videos supported...
    return (selected_vids[index] % 2) + 1;
}

function getVideoPath(index) {
    return VIDEO_LOCATION + "\\" + index + "-" + getVideoNumber(index) + ".mp4";
}

function advanceVideo(video, index, play = true) {
    video.src = getVideoPath(index);
    if (play) {
        video.play();
    }
}

function resetSelectedVids() {
    // Random: See https://www.w3schools.com/js/js_random.asp
    for (let index = 0; index < selected_vids.length; index++) {
        selected_vids[index] = Math.floor(Math.random() * VIDEOS_PER_CATEGORY);
    }
}

function initPreview() {
    for (let col_index = 0; col_index < AMOUNT_OF_CATEGORIES; col_index++) {
        for (let row_index = 0; row_index < VIDEOS_PER_CATEGORY; row_index++) {
            let current_id = (col_index + 1) + "-" + (row_index + 1);
            let cell = document.getElementById("col_" + row_index + "_" + col_index);
            cell.innerHTML = "<img src=previews\\" + current_id + ".png alt=imagealt />"
        }
    }
}
function previewMain() {
    resetSelectedVids();
    // Move to function of a button
    for (let col_index = 0; col_index < AMOUNT_OF_CATEGORIES; col_index++) {
        for (let row_index = 0; row_index < VIDEOS_PER_CATEGORY; row_index++) {
            let cell = document.getElementById("col_" + row_index + "_" + col_index);
            let inner_img = cell.getElementsByTagName("img")[0];
            if (row_index == selected_vids[col_index]) {
                inner_img.id = "selected";
            } else {
                inner_img.id = "unselected";
            }
        }
    }
}

function toggleDivDisplay(div_id, hidden = true) {
    document.getElementById(div_id).style.display = hidden ? "none" : "block";
}

function mainVideo() {
    console.log("main started");
    var video = document.getElementById("video");
    let i = 1;
    advanceVideo(video, i, play = false);
    video.addEventListener('ended', (event) => {
        console.log('video stopped.');
        i = i + 1;
        if (i <= VIDEOS_PER_ROUND) {
            advanceVideo(video, i);
        } else {
            console.log("done");
        }
    });
}

function stopVideo() {
    var video = document.getElementById("video")
    video.pause();
    video.currentTime = 0;
}

let selected_vids = [0, 0, 0, 0, 0];
initPreview();
previewMain();
toggleDivDisplay("vid", true);
document.getElementById('btn_preview').addEventListener("click", (_) => {
    toggleDivDisplay("preview", true);
    toggleDivDisplay("vid", false);
    mainVideo();
}); document.getElementById('btn_vid').addEventListener("click", (_) => {
    toggleDivDisplay("preview", false);
    toggleDivDisplay("vid", true);
    stopVideo();
    previewMain();
});