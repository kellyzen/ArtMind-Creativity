// Start modal popup
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
    var timerElement = document.getElementById('timer');

    // Check if the timer element with the specified ID exists
    if (!timerElement) {
        return;
    }

    var presentTime = timerElement.innerHTML;
    var timeArray = presentTime.split(/[:]+/);
    var m = timeArray[0];
    var s = checkSecond((timeArray[1] - 1));

    if (s == 59) { m = m - 1 }

    if (m < 0) {
        // loadEndModal(); // Countdown time ended
        return;
    }

    timerElement.innerHTML = m + ":" + s;
    setTimeout(startTimer, 1000);
}

// Helper function to add leading zero to seconds
function checkSecond(sec) {
    if (sec < 10 && sec >= 0) { sec = "0" + sec }; // add zero in front of numbers < 10
    if (sec < 0) { sec = "59" };
    return sec;
}


// Buttons behaviour onclick during test
function giveUp() {
    var confirmQuit = window.confirm('Do you really want to quit the test?');

    if (confirmQuit) {
        // If the user clicks "OK" in the confirmation dialog
        giveUpClicked = true;
        location.reload();
    }
}

function submit() {
    var confirmSubmit = window.confirm('Are you sure you want to submit the test?');

    if (confirmSubmit) {
     loadEndModal();
    }
}

// Load end modal after test ended
function loadEndModal() {
    document.getElementById('modal-end').classList.add('open');
    downloadImage();
}

// Draw lines
function drawLineToContext(context, x0, y0, x1, y1, color) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 5;
    context.stroke();
}

// Sends the drawing to Roboflow for predictions and create URL for the drawing
async function downloadImage() {
    // Redraw on a new offscreenCanvas
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

    try {
        // Perform object detection on the drawn image
        // await detectObjects(offscreenCanvas);

        // Convert canvas data to URL
        const imageURL = offscreenCanvas.toDataURL();

        // Once the predictions are received, fetch the result content
        fetchResultContent(imageURL);
    } catch (error) {
        console.error("Error in object detection:", error);
    }
}

// Connect to Roboflow model
async function detectObjects(canvas) {
    try {
        // Load the model
        var model = await roboflow.auth({
            publishable_key: "rf_0wAMiUr3JaWSL9bxUTSvSb899nT2"
        }).load({
            model: "artmind-repeated-figure-test",
            version: 1
        });

        // Detect objects in the canvas
        var predictions = await model.detect(canvas);
        console.log("Predictions:", predictions);

        // Handle predictions as needed
    } catch (error) {
        console.error("Error detecting objects:", error);
    }
}

// Load result page
function fetchResultContent(drawnImageURL) {
    // Fetch the content from result.html
    fetch('dev/test/result.html')
        .then(response => response.text())
        .then(data => {
            // Replace the content in the test-container with the content from result.html
            document.querySelector('#test-container').innerHTML = data;

            // Set the source of the result image
            document.querySelector('#result-img').src = drawnImageURL;

            // Attach event listener to the download button
            document.querySelector('#download-btn').addEventListener('click', function () {
                const link = document.createElement('a');
                link.download = `drawn_image_${Date.now()}.jpg`;
                link.href = drawnImageURL;
                link.click();
            });
        })
        .catch(error => console.error('Error fetching result.html:', error))
}