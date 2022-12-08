let selected_vids = [0, 0, 0, 0];
let timer_interval_id;
let interval_stop_value;
let first_run = true;
let pre_click_gif = new SuperGif({gif: document.getElementById("start_button_unclicked_gif"), loop_mode: true, on_end: unClickedGifLoopEnd});
let clicked_gif = new SuperGif({gif: document.getElementById("start_button_clicked_gif"), loop_mode: false, on_end: buttonClickedAnimationDone});
let phase_ = PHASES.INIT;

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

function getVideoPath(index, sub_index) {
    sub_index++; // Off by one.
    return VIDEO_LOCATION + "\\" + getVideoNumber(index) + "_" + index + "(" + sub_index + ").mp4";
}

function resetSelectedVids() {
    if (first_run) {
        selected_vids = [0,0,0,0];
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
        for (let sub_vid_index = 0; sub_vid_index < SUB_VIDEOS_CATEGORIES[vid_index][getVideoNumber(vid_index)]; sub_vid_index++) {
            let vid_css_selector = "vid"+vid_index+"_"+sub_vid_index;
            let vid = document.getElementById(vid_css_selector);
            let selected_video = getVideoPath(vid_index, sub_vid_index);
            console.log("index is " + vid_index + ", sub index is: " + sub_vid_index);
            console.log("setting video from path " + selected_video);
            console.log("vid css selector is " + vid_css_selector)
            vid.src = selected_video;
            vid.onended = onVideoEnds;
            vid.preload = "auto";
        }
    }
    phase_ = PHASES.PRE_MAIN;
    // Originally, we waited for video to load. When hosted, it caused some issues. 
    // Since gif loading takes time anyways - decided not to wait for it.}
    preMain();
}

function onVideoEnds(event) {
    index = event.srcElement.id[3];
    sub_index = event.srcElement.id[5];
    console.log('video ' + event.srcElement.id + ' ended.');
    toggleDivDisplay(event.srcElement.id, hidden = true);
    sub_index++;
    if (sub_index < SUB_VIDEOS_CATEGORIES[index][getVideoNumber(index)]) {
        let sub_vid_css_selector = "vid"+index+"_"+sub_index;
        toggleDivDisplay(sub_vid_css_selector, hidden = false);
        document.getElementById(sub_vid_css_selector).play();
        return;
    }
    index++;
    if (index < AMOUNT_OF_CATEGORIES) {
        toggleDivDisplay("vid" + index+"_0", hidden = false);
        document.getElementById("vid" + index+"_0").play();
    } else {
        console.log("done");
        clearInterval(timer_interval_id);
        document.getElementById("timer").innerHTML = "";
        setupVideos();
    }
}

function preMain() {
    if (phase_ != PHASES.PRE_MAIN) {
        console.warn("pre main called in wrong phase");
        return;
    } else {
        console.log("pre main starts in correct phase");
    }
    if (pre_click_gif.get_canvas() === undefined) {
    pre_click_gif.load(() => {
        console.log("pre click gif loaded")
        clicked_gif.load(() => {
            console.log("post click gif loaded")
            shouldStop = false;
            pre_click_gif.get_canvas().onclick = buttonClicked;
            pre_click_gif.play();
            toggleDivDisplay("start_button_unclicked", false);
            toggleDivDisplay("start_button_clicked", true);
            toggleDivDisplay("start_button_div", false)
        })
    });
    } else {
        shouldStop = false;
        pre_click_gif.move_to(0);
        clicked_gif.move_to(0);
        pre_click_gif.play();
        console.log("showing pre-loaded button gif");
        toggleDivDisplay("start_button_unclicked", false);
        toggleDivDisplay("start_button_clicked", true);
        toggleDivDisplay("start_button_div", false)
    }

}

function unClickedGifLoopEnd() {
    if (shouldStop) {
        console.log("should stop!")
        pre_click_gif.pause();
        clicked_gif.play();
        toggleDivDisplay("start_button_unclicked", true);
        toggleDivDisplay("start_button_clicked", false);
    }
}

function buttonClicked() {
    console.log("stop")
    shouldStop = true;
}

function buttonClickedAnimationDone() {
    console.log("clicked gif loop done")
    clicked_gif.pause()
    toggleDivDisplay("start_button_clicked", true);
    toggleDivDisplay("start_button_div", true);
    document.querySelector("body").requestFullscreen();
    phase_ = PHASES.ROULETTE;
    mainOpener();
}

function mainOpener() {
    toggleDivDisplay("opener", hidden = false);
    rouletteMain(function() {dropWriteUpper(startVideos)});
}

function mainVideo() {
    toggleDivDisplay('vid0_0', hidden = false);
    video = document.getElementById('vid0_0');
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
        phase_ = PHASES.MOVIE;
        mainVideo();
        startTimer();
        clearOpenerTexts();
        restartImgs();
    }, 4000);
}

function main() {
    console.log("main started");
    setupVideos();
}

main();
