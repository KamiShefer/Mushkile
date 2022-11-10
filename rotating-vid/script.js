// If autoplay doesn't work - Install edge, go to browser settings and change autoplay to allowed.
// This can also be done directly via prefs in Chrome.

let selected_vids = [0, 0, 0, 0];
let timer_interval_id;
let interval_stop_value;
let first_run = true;

function formatTime(timeRepr) {
    timeRepr = timeRepr.toString();
    if (timeRepr.length >= 2) {
        return timeRepr.substring(0, 2);
    }
    else if (timeRepr.length == 1) {
        return '0' + timeRepr;
    }
    return '00';
}

function seperateTimePieces(timeInMs) {
    var minutes = Math.floor((timeInMs % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((timeInMs % (1000 * 60)) / 1000);
    var milliseconds = Math.floor(timeInMs % 1000 / 10); // Divide by 10 to get only 2 first digits
    return {"minutes": formatTime(minutes), "seconds": formatTime(seconds), "milliseconds": formatTime(milliseconds)};
}

function startTimer() {
    // Set the date we're counting down to
    var countDownDate = new Date().getTime();
    // Update the count down every 1 second
    timer_interval_id = setInterval(function () {

        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = now - countDownDate;
        var timePieces = seperateTimePieces(distance);

        // Output the result in an element with id="demo"
        document.getElementById("timer").innerHTML = formatTime(timePieces["minutes"]) + ":" + formatTime(timePieces["seconds"]) + ":" + formatTime(timePieces["milliseconds"]);
    }, 100);
    console.log("timer " + timer_interval_id)
}

function getVideoNumber(index) {
    return selected_vids[index];
}

function getVideoPath(index) {
    return VIDEO_LOCATION + "\\" + index + "-" + getVideoNumber(index) + ".mp4";
}

function resetSelectedVids() {
    if (first_run) {
        selected_vids = [VIDEOS_PER_CATEGORY-1,VIDEOS_PER_CATEGORY-1,VIDEOS_PER_CATEGORY-1,VIDEOS_PER_CATEGORY-1];
        first_run = false;
    } else {
        // Random: See https://www.w3schools.com/js/js_random.asp
        for (let index = 0; index < selected_vids.length; index++) {
            selected_vids[index] = Math.floor(Math.random() * VIDEOS_PER_CATEGORY);
        }
    }
}

function calculateMovieId() {
    return selected_vids.reduce((partialSum, a) => partialSum + a, 0);
}

function calculateMovieLength() {
    let totalMilliseconds = 0;
    for (let index = 0; index < selected_vids.length; index++) {
        totalMilliseconds += VIDEO_LENGTHS_IN_MILLISECONDS[index][selected_vids[index]];
    }

    return seperateTimePieces(totalMilliseconds);
}

function toggleDivDisplay(div_id, hidden = true) {
    document.getElementById(div_id).style.display = hidden ? "none" : "block";
}

function toggleDivDisplaySelector(selector, hidden = true) {
    if (hidden) {
      $(selector).hide();
    } else {
      $(selector).show();
    }
}

function makeTypingSound(callback) {
    let audioElement = document.getElementById("typing_short");
    if (callback) {
        audioElement.addEventListener("ended", (event) => {
            callback();
        }, 
        {"once": true});
    }
    audioElement.play();
}

function setupVideos() {
    resetSelectedVids();
    for (let vid_index = 0; vid_index < AMOUNT_OF_CATEGORIES; vid_index++) {
        toggleDivDisplay("vid" + vid_index, hidden = true);
        let vid = document.getElementById("vid" + vid_index);
        let selected_video = getVideoPath(vid_index);
        console.log("index is " + vid_index)
        console.log("setting video from path " + selected_video);
        vid.src = selected_video;
        vid.onended = onVideoEnds;
        vid.preload = "auto";
    }
}

function onVideoEnds(event) {
    index = event.srcElement.id[3];
    console.log('video ' + index + ' ended.');
    toggleDivDisplay("vid" + index, hidden = true);
    index++;
    if (index < AMOUNT_OF_CATEGORIES) {
        toggleDivDisplay("vid" + index, hidden = false);
        document.getElementById("vid" + index).play();
    } else {
        console.log("done");
        clearInterval(timer_interval_id);
        document.getElementById("timer").innerHTML = "";
        setupVideos();
    }
}

function mainOpener() {
    toggleDivDisplay("opener", hidden = false);
    rouletteMain(function() {dropWriteUpper(startVideos)});
}

function mainVideo() {
    toggleDivDisplay('vid0', hidden = false);
    video = document.getElementById('vid0');
    video.muted = false;
    video.play();
}

function dropWriteUpper(callback) {
    makeTypingSound();

    let text = "סרט מספר " + calculateMovieId();
    dropWriteString(
        document.getElementById("upperText"),
        text,
        () => { dropWriteLower(callback) }
    );
}

function dropWriteLower(callback) {
    makeTypingSound(callback);

    let movieLength = calculateMovieLength();
    let textToDisplay = "אורך הסרט\n" + movieLength.minutes + ":" + movieLength.seconds + ":" + movieLength.milliseconds + "\nמתוך\n07:52:86";
    dropWriteString(
        document.getElementById("lowerText"),
        textToDisplay,
        undefined
        );
}

let drop_write_interval_id;
function dropWriteString(element, data, callback) {
    let i = 0;
    drop_write_interval_id = setInterval(() => {
        if (i == data.length) {
            console.log("dropwrite done");
            clearInterval(drop_write_interval_id);
            if (callback) {
                callback();
            }
            return;
        }
        let charToAdd = data[i];
        if (charToAdd == '\n') {
            charToAdd = "<br />"
        }
        element.innerHTML += charToAdd;
        i++;
    }, 120);
}

function clearOpenerTexts() {
    document.getElementById("upperText").innerHTML = ""
    document.getElementById("lowerText").innerHTML = ""
}


function roll(shown, col, endCallback) {
    if (idStop < Number(col[col.length - 1]) || selected[col[col.length - 1]] != shown) {
      $("div#" + col + " img.num" + shown).animate({ top: "-250px" }, speed = 120, callback=()=>{roll2(shown, col, endCallback)});
    } else {
        idStop++;
      $("div#" + col + " img.num" + shown).animate({ top: "0" }, speed = 120, callback=endCallback);
    }
  }

function roll2(shown, col, endCallback) {
    toggleDivDisplaySelector("div#" + col + " img.num" + shown)
    shown = (shown + 1) % 10;
    toggleDivDisplaySelector("div#" + col + " img.num" + shown, hidden=false);
    $("div#" + col + " img.num" + shown).animate({ top: "250px" }, speed = 120, callback = function () { roll(shown, col, endCallback) });
}

function restartImgs() {
    for (let col=0; col<selected.length; col++) {
        for (let i=0; i<10; i++) {
            toggleDivDisplaySelector("div#col" + col + " img.num" + i, hidden=true);
            $("div#col" + col + " img.num" + i).css("top", "0");
        }
        toggleDivDisplaySelector("div#col" + col + " img.num" + 1, hidden=false);
    }
}

let selected = [-1, -1, -1, -1, -1, -1]
let idStop = -1;
function rouletteMain(endCallback) {
    let rouletteIntervalId;
    let rollId = 0;
    selected = [-1, -1, -1, -1, -1, -1]
    idStop = -1;
    rouletteIntervalId = setInterval(() => {
        if (rollId == 6) {
        clearInterval(rouletteIntervalId);
        return;
        }
        let callback = function(){};
        if (rollId == 5)
            callback = endCallback;
        roll(1, "col" + rollId, callback);
        rollId++;
    }
        , 200);
    setTimeout(() => { 
        idStop = 0;
        movieLength = calculateMovieLength();
        selected = [movieLength.minutes[0], movieLength.minutes[1], movieLength.seconds[0], movieLength.seconds[1], movieLength.milliseconds[0], movieLength.milliseconds[1]]; 
    }, 1500);
}

function startVideos() {
    setTimeout(() => {
        toggleDivDisplay("opener", hidden = true);
        mainVideo();
        startTimer();
        clearOpenerTexts();
        restartImgs();
    }, 4000);
}

function main() {
    console.log("main started");
    setupVideos();
    document.getElementById("vid0").addEventListener("canplaythrough", () => { mainOpener(); });
}

main();
