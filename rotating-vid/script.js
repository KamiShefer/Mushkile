// If autoplay doesn't work - Install edge, go to browser settings and change autoplay to allowed.
// This can also be done directly via prefs in Chrome.

let selected_vids = [0, 0, 0, 0];
let interval_id;
let interval_stop_value;

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

function startTimer() {
    // Set the date we're counting down to
    var countDownDate = new Date().getTime();
    // Update the count down every 1 second
    interval_id = setInterval(function () {

        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = now - countDownDate;

        // Time calculations for days, hours, minutes and seconds
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        var milliseconds = distance % 1000;

        // Output the result in an element with id="demo"
        document.getElementById("timer").innerHTML = formatTime(minutes) + ":" + formatTime(seconds) + ":" + formatTime(milliseconds);
    }, 100);
}

function getVideoNumber(index) {
    return selected_vids[index];
}

function getVideoPath(index) {
    return VIDEO_LOCATION + "\\" + index + "-" + getVideoNumber(index) + ".mp4";
}

function resetSelectedVids() {
    // Random: See https://www.w3schools.com/js/js_random.asp
    for (let index = 0; index < selected_vids.length; index++) {
        selected_vids[index] = Math.floor(Math.random() * VIDEOS_PER_CATEGORY);
    }
}

function calculateMovieId() {
    return selected_vids.reduce((partialSum, a) => partialSum + a, 0);
}

function calculateMovieLength() {
    let totalSeconds = 0;
    for (let index = 0; index < selected_vids.length; index++) {
        totalSeconds += VIDEO_LENGTHS_IN_SECONDS[index][selected_vids[index]];
    }

    return { "minutes": formatTime(Math.floor(totalSeconds / 60)), "seconds": formatTime(totalSeconds % 60) };
}

function toggleDivDisplay(div_id, hidden = true) {
    document.getElementById(div_id).style.display = hidden ? "none" : "block";
}

function saySomething(sentence, callback) {
    let spoken = new SpeechSynthesisUtterance(sentence);
    if (callback) {
        spoken.addEventListener("end", callback);
    }
    spoken.lang = "he";
    spoken.rate = 0.85;
    speechSynthesis.speak(spoken);
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
        clearInterval(interval_id);
        document.getElementById("timer").innerHTML = "";
        setupVideos();
    }
}

function mainOpener() {
    toggleDivDisplay("opener", hidden = false);
    dropWriteUpper(startVideos);
}

function mainVideo() {
    toggleDivDisplay('vid0', hidden = false);
    video = document.getElementById('vid0');
    video.muted = false;
    video.play();
}

function dropWriteUpper(callback) {
    let text = "סרט מספר " + calculateMovieId();
    saySomething(text);
    dropWriteString(
        document.getElementById("upperText"),
        text,
        () => { dropWriteLower(callback) }
    );
}

function dropWriteLower(callback) {
    let movieLength = calculateMovieLength();

    let textToDisplay = "אורך הסרט\n" + movieLength.minutes + ":" + movieLength.seconds + ":00\nמתוך\n07:30:17";
    let minutesPronoun = movieLength.minutes == 1 ? " דקה אחת" : movieLength.minutes + "דקות ";
    let textToSay = "אורך הסרט" + minutesPronoun + " ו" + movieLength.seconds + "שניות מתוך 07 דקות ו30 שניות";
    saySomething(textToSay, callback);
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

function startVideos() {
    setTimeout(() => {
        toggleDivDisplay("opener", hidden = true);
        mainVideo();
        startTimer();
        clearOpenerTexts();
    }, 3000);
}

function main() {
    console.log("main started");
    setupVideos();
    document.getElementById("vid0").addEventListener("canplaythrough", () => { mainOpener(); });
}

main();
