// Modal popup
document.getElementById('modal-start').classList.add('open');

function startTest() {
    document.getElementById('modal-start').classList.remove('open');
    startTimer();
}

function updateButtonState() {
    var checkbox = document.getElementById("tnc-checkbox");
    var button = document.getElementById("start-btn");

    // Update button state based on checkbox
    button.disabled = !checkbox.checked;
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

// Test
function giveUp() {
    var confirmQuit = window.confirm('Do you really want to quit the test?');

    if (confirmQuit) {
        // If the user clicks "OK" in the confirmation dialog
        giveUpClicked = true;
        location.reload();
    }
}

function submit() {
    var confirmQuit = window.confirm('Are you sure you want to submit the test?');

    if (confirmQuit) {
        // document.getElementById('modal-end').classList.add('open');
        downloadImage();
    }
}

function downloadImage() {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 1150;
    offscreenCanvas.height = 650;

    const offscreenContext = offscreenCanvas.getContext('2d');
    offscreenContext.fillStyle = '#fff';
    offscreenContext.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

    // Draw all strokes on the offscreen canvas
    for (let i = 0; i < drawings.length; i++) {
        const line = drawings[i];
        drawLineToContext(offscreenContext, line.x0, line.y0, line.x1, line.y1, line.color);
    }

    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = offscreenCanvas.toDataURL();
    link.click();
}

function drawLineToContext(context, x0, y0, x1, y1, color) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 5;
    context.stroke();
}