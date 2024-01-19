// Modal popup
document.getElementById('modal-start').classList.add('open');

function startTest() {
    document.getElementById('modal-start').classList.remove('open');
    startTimer();
}

// Countdown Timer
function startTimer() {
    var presentTime = document.getElementById('timer').innerHTML;
    var timeArray = presentTime.split(/[:]+/);
    var m = timeArray[0];
    var s = checkSecond((timeArray[1] - 1));
    if (s == 59) { m = m - 1 }
    if (m < 0) {
        // document.getElementById('modal-end').classList.add('open');
        return
    }

    document.getElementById('timer').innerHTML =
        m + ":" + s;
    setTimeout(startTimer, 1000);

}

function checkSecond(sec) {
    if (sec < 10 && sec >= 0) { sec = "0" + sec };
    if (sec < 0) { sec = "59" };
    return sec;
}