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
        const predictionResult = await detectObjects(offscreenCanvas);
        // const predictionResult = null;///////////////////

        // Convert canvas data to URL
        const imageURL = offscreenCanvas.toDataURL();

        // Once the predictions are received, fetch the result content
        fetchResultContent(imageURL, predictionResult);
    } catch (error) {
        console.error("Error in object detection:", error);
    }
}

// Connect to Roboflow model
async function detectObjects(canvas) {
    try {
        // Load the model
        var model = await roboflow.auth({
            publishable_key: "rf_UwJWYh9v5YWZoyJfnYP96FteO043"
        }).load({
            model: "artmind-detection",
            version: 1
        });

        model.configure({
            threshold: 0,
            overlap: 0.5,
            max_objects: 50
        });

        // Detect objects in the canvas
        var predictions = await model.detect(canvas);

        var classesAndConfidences = [];
        predictions.forEach(prediction => {
            var classAndConfidence = {
                class: prediction.class,
                confidence: prediction.confidence
            };
            classesAndConfidences.push(classAndConfidence);
        });

        classesAndConfidences = classesAndConfidences.filter(prediction => prediction.class != "moon");

        console.log("Predictions:", classesAndConfidences);
        return classesAndConfidences;

        // Handle predictions as needed
    } catch (error) {
        console.error("Error detecting objects:", error);
        return [];
    }
}

// Load result page
async function fetchResultContent(drawnImageURL, predictionResult) {
    try {
        // Calculate the result score
        const finalEval = await calculateScore(predictionResult);
        const fluencyList = finalEval.fluency;
        const fluencyScore = finalEval.fluencyScore;
        const elaborationList = finalEval.elaboration;
        const elaborationScore = finalEval.elaborationScore;

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

                // Set fluency score
                document.querySelector('#fluency-score').innerHTML = fluencyScore + " stimulus identified (" + fluencyScore + " points!)";
                document.querySelector('#fluency-desc').innerHTML = "The identified stimulus in your drawing are: <u>" + fluencyList + "</u>";

                // Set elaboration score
                document.querySelector('#elaboration-score').innerHTML = elaborationScore + " points!";
                document.querySelector('#elaboration-desc').innerHTML = "The identified additional elements in your drawing are: <u>" + elaborationList +"</u>";
            })
            .catch(error => console.error('Error fetching result.html:', error))
    } catch (error) {
        console.error('Error:', error);
    }
}

// Calculate total, fluency, originality & elaboration score
async function calculateScore(predictionResult) {
    let fluencyList = [];
    let fluencyScore = 0;
    let originalityList = [];
    let originalityScore = 0;
    let elaborationList = [];
    let elaborationScore = 0;

    try {
        // Fetch scoreData from JSON
        const response = await fetch('http://localhost:3000/assets/score.json');
        const json = await response.json();

        // calculate fluency score
        fluencyList = calculateFluency(predictionResult, json);
        fluencyScore = fluencyList.length;

        // calculate elaboration score
        elaborationList = calculateElaboration(predictionResult, json);
        if (elaborationList.length < 6) {
            elaborationScore = 1;
        } else {
            elaborationScore = 2;
        }

        return { 
            fluency: fluencyList, 
            fluencyScore: fluencyScore,
            originality: originalityList,
            originalityScore: originalityScore, 
            elaboration: elaborationList,
            elaborationScore: elaborationScore
        };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}


function calculateFluency(predictionResult, resultJson) {
    let maxScore = 18;
    const fluencyScores = [];

    // Sort the predictionResult array in descending order based on confidence
    predictionResult.sort((a, b) => b.confidence - a.confidence);

    // Identify top classes with "elaboration": "basic"
    const basicElaborationClasses = resultJson
        .filter(score => score.elaboration === 'basic')
        .map(score => ({ class: score.class, display: score.display }));

    for (const prediction of predictionResult) {
        if (fluencyScores.length >= maxScore) break;
        for (const score of basicElaborationClasses) {
            if (score.class === prediction.class && !fluencyScores.includes(score.display)) {
                fluencyScores.push(score.display);
                break;
            }
        }
    }

    return fluencyScores;
}

function calculateElaboration(predictionResult, resultJson) {
    const elaborationScores = [];

    // Identify top classes with "elaboration": "additional"
    const basicElaborationClasses = resultJson.filter(score => score.elaboration === 'additional').map(score => score.class);

    for (const prediction of predictionResult) {
        if (basicElaborationClasses.includes(prediction.class) && !elaborationScores.some(score => score.class === prediction.class)) {
            elaborationScores.push([prediction.class]);

        }
    }

    return elaborationScores;
}
