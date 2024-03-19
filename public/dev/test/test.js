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
        loadEndModal(); // Countdown time ended
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
            version: 2
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
        const originalityList0 = finalEval.originality0;
        const originalityList1 = finalEval.originality1;
        const originalityList2 = finalEval.originality2;
        const originalityListAdd = finalEval.originality3;
        const originalityScore = finalEval.originalityScore;
        const elaborationList = finalEval.elaboration;
        const elaborationScore = finalEval.elaborationScore;
        const finalScore = finalEval.finalScore;
        const scoreCategory = finalEval.scoreCategory;
        const scoreRange = finalEval.scoreRange;
        const scoreDesc = finalEval.scoreDesc;

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

                // Set final score
                document.querySelector('#final-score').innerHTML = "Score: " + finalScore + "%";
                document.querySelector('#final-category').innerHTML = "(" + scoreCategory + ")";
                document.querySelector('#final-progress').value = Math.min(Math.max(finalScore, 0), 100);

                // Set score analysis
                document.querySelector('#score-category').innerHTML = scoreCategory + scoreRange;
                document.querySelector('#score-desc').innerHTML = scoreDesc;

                // Set fluency score
                document.querySelector('#fluency-score').innerHTML = fluencyScore + " point(s) (total: 18)";
                document.querySelector('#fluency-desc').innerHTML = "The identified stimulus in your drawing are: <u>" + fluencyList + "</u>";

                // Set originality score
                document.querySelector('#originality-score').innerHTML = originalityScore + " point(s) (total: 36)";
                document.querySelector('#originality-desc-2').innerHTML = "Most unique (+2): " + originalityList2;
                document.querySelector('#originality-desc-1').innerHTML = "Less common (+1): " + originalityList1;
                document.querySelector('#originality-desc-0').innerHTML = "Most common (+0): " + originalityList0;
                document.querySelector('#originality-desc-add').innerHTML = "Additional point (+1): " + originalityListAdd;

                // Set elaboration score
                document.querySelector('#elaboration-score').innerHTML = elaborationScore + " point(s) (total: 36)";
                document.querySelector('#elaboration-desc').innerHTML = "The identified additional elements in your drawing are: <u>" + elaborationList + "</u>";
            })
            .catch(error => console.error('Error fetching result.html:', error))
    } catch (error) {
        console.error('Error:', error);
    }
}

// Calculate total, fluency, originality & elaboration score
async function calculateScore(predictionResult) {
    const maxFluencyScore = 18;
    const maxOriginalityScore = 36;
    const maxElaborationScore = 2;

    let fluencyList = [];
    let fluencyScore = 0;
    let originalityList0 = [];
    let originalityList1 = [];
    let originalityList2 = [];
    let originalityListAdd = [];
    let originalityScore = 0;
    let elaborationList = [];
    let elaborationScore = 0;
    let finalScore = 0;
    let scoreCategory = "";
    let scoreRange = "";
    let scoreDesc = "";

    try {
        // Fetch scoreData from JSON
        const response = await fetch('http://localhost:3000/assets/score.json');
        const json = await response.json();

        const basicElement = await calculateFluency(predictionResult, json);
        fluencyList = basicElement.fluencyScores;
        fluencyScore = fluencyList.length;

        const originalityLists = await calculateOriginality(fluencyList, basicElement.originalityScores);
        originalityList0 = originalityLists.originalityList0;
        originalityList1 = originalityLists.originalityList1;
        originalityList2 = originalityLists.originalityList2;
        originalityListAdd = originalityLists.originalityListAdd;
        originalityScore = originalityLists.originalityScore;

        // calculate elaboration score
        elaborationList = await calculateElaboration(predictionResult, json);
        if (elaborationList.length > 5) {
            elaborationScore = 2;
        } else if (elaborationList.length > 1) {
            elaborationScore = 1;
        } else {
            elaborationScore = 0;
        }

        finalScore = Math.round((fluencyScore + originalityScore + elaborationScore) / (maxFluencyScore + maxOriginalityScore + maxElaborationScore) * 100);
        const analysis = await scoreAnalysis(finalScore);
        scoreCategory = analysis.scoreCategory;
        scoreDesc = analysis.scoreDesc;
        scoreRange = analysis.scoreRange;

        return {
            fluency: fluencyList,
            fluencyScore: fluencyScore,
            originality0: originalityList0,
            originality1: originalityList1,
            originality2: originalityList2,
            originality3: originalityListAdd,
            originalityScore: originalityScore,
            elaboration: elaborationList,
            elaborationScore: elaborationScore,
            finalScore: finalScore,
            scoreCategory: scoreCategory,
            scoreRange: scoreRange,
            scoreDesc: scoreDesc
        };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function calculateFluency(predictionResult, resultJson) {
    let maxScore = 18;
    const fluencyScores = [];
    const originalityScores = [];

    // Sort the predictionResult array in descending order based on confidence
    predictionResult.sort((a, b) => b.confidence - a.confidence);

    // Identify top classes with "elaboration": "basic"
    const basicElaborationClasses = resultJson
        .filter(score => score.elaboration === 'basic')
        .map(score => ({ class: score.class, display: score.display, originality: score.originality }));

    for (const prediction of predictionResult) {
        if (fluencyScores.length >= maxScore) break;
        for (const score of basicElaborationClasses) {
            if (score.class === prediction.class && !fluencyScores.includes(score.display)) {
                fluencyScores.push(score.display);
                originalityScores.push(score.originality);
                break;
            }
        }
    }

    const fluencyScoresWithSpace = fluencyScores.map(item => item + ' ');

    return {
        fluencyScores: fluencyScoresWithSpace,
        originalityScores: originalityScores
    };
}

async function calculateOriginality(fluencyList, originalityScores) {
    // Initialize originality lists
    let originalityScore = 0;
    let originalityList0 = [];
    let originalityList1 = [];
    let originalityList2 = [];
    let originalityListAdd = [];
    let originalityAdditional = ["bicycle", "traffic light", "transport", "venn diagram/ olympic", "glasses"];

    // Loop through each item in fluencyList
    for (let i = 0; i < fluencyList.length; i++) {
        // Check the originality score for the current item
        let score = originalityScores[i];
        originalityScore += score;

        // Determine which originality list to add the item to based on its originality score
        if (score === 0) {
            originalityList0.push(fluencyList[i]);
        } else if (score === 1) {
            originalityList1.push(fluencyList[i]);
        } else {
            originalityList2.push(fluencyList[i]);
        } 

        // Determine if additional scores should be added
        if (originalityAdditional.includes(fluencyList[i])) {
            originalityListAdd.push(fluencyList[i]);
            originalityScore ++;
        }
    }

    return {
        originalityScore: originalityScore,
        originalityList0: originalityList0,
        originalityList1: originalityList1,
        originalityList2: originalityList2,
        originalityListAdd: originalityListAdd
    };
}

async function calculateElaboration(predictionResult, resultJson) {
    const elaborationScores = new Set(); // Use a Set to store unique values

    // Identify top classes with "elaboration": "additional"
    const basicElaborationClasses = resultJson.filter(score => score.elaboration === 'additional').map(score => score.class);

    for (const prediction of predictionResult) {
        if (basicElaborationClasses.includes(prediction.class)) {
            elaborationScores.add(prediction.class); // Add the class to the Set
        }
    }

    // Convert the Set back to an array and append a space to each item
    const elaborationScoresWithSpace = [...elaborationScores].map(item => item + ' ');

    return elaborationScoresWithSpace;
}

async function scoreAnalysis(finalScore) {
    let scoreCategory;
    let scoreRange;
    let scoreDesc;

    switch (true) {
        case (finalScore >= 97):
            scoreCategory = "Very strong";
            scoreRange = " (97-100%)";
            scoreDesc = "Exceptional! You exhibit a very strong sense of creativity, showcasing a remarkable ability to think outside conventional boundaries. Your imaginative skills are outstanding. Keep exploring and pushing your creative limits.";
            break;
        case (finalScore >= 85):
            scoreCategory = "Strong";
            scoreRange = " (85-96%)";
            scoreDesc = "Congratulations! Your creativity is strong, reflecting a high level of imaginative thinking. Continue to challenge yourself with new and innovative projects to further develop your creative prowess.";
            break;
        case (finalScore >= 61):
            scoreCategory = "Above average";
            scoreRange = " (61-84%)";
            scoreDesc = "Your creativity is above average, indicating a strong ability to think creatively. Keep nurturing this skill by engaging in diverse creative activities.";
            break;
        case (finalScore >= 41):
            scoreCategory = "Average";
            scoreRange = " (41-60%)";
            scoreDesc = " You demonstrate a moderate level of creativity. Continue to explore different creative outlets and approaches to further enhance your imaginative thinking.";
            break;
        case (finalScore >= 17):
            scoreCategory = "Below average";
            scoreRange = " (17-40%)";
            scoreDesc = "There is room for improvement in your creativity. Explore various creative exercises and try to think outside the box to enhance your imaginative skills.";
            break;
        default:
            scoreCategory = "Weak";
            scoreRange = " (0-16%)";
            scoreDesc = "Your creativity may benefit from further exploration and development. Consider experimenting with new ideas and perspectives to enhance your creative abilities.";
            break;
    }

    return {
        scoreCategory: scoreCategory,
        scoreRange: scoreRange,
        scoreDesc: scoreDesc
    };
}
