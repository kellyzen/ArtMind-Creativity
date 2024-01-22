// get canvas element
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// disable right clicking
document.oncontextmenu = function () {
    return false;
}

// list of all strokes drawn
const drawings = [];

// coordinates of mouse cursor
let cursorX;
let cursorY;
let prevCursorX;
let prevCursorY;

// distance from origin
let offsetX = 0;
let offsetY = 0;

// zoom amount
let scale = 1;

// convert coordinates
function toScreenX(xTrue) {
    return (xTrue + offsetX) * scale;
}
function toScreenY(yTrue) {
    return (yTrue + offsetY) * scale;
}
function toTrueX(xScreen) {
    return (xScreen / scale) - offsetX;
}
function toTrueY(yScreen) {
    return (yScreen / scale) - offsetY;
}
function trueHeight() {
    return canvas.clientHeight / scale;
}
function trueWidth() {
    return canvas.clientWidth / scale;
}

function getCursorPosition(event) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}

// Draw 6x3 grid of black circles
function generateCircle(cx, cy, radius, numPoints) {
    const circlePoints = [];

    for (let i = 0; i < numPoints; i++) {
        const theta = (i / numPoints) * (2 * Math.PI);
        const x = cx + radius * Math.cos(theta);
        const y = cy + radius * Math.sin(theta);

        circlePoints.push({ x, y });
    }

    return circlePoints;
}

let circlesAdded = 0;
const circleRadius = 60;
const circleMargin = 50;
const rectWidth = (6 * circleMargin + circleRadius * 2 * 6) + 2 * circleMargin;
const rectHeight = (3 * circleMargin + circleRadius * 2 * 3) + 2 * circleMargin;
function drawCirclesAndRectangle() {
    // Draw rectangle
    const rectX = 575 - rectWidth / 2 + offsetX;
    const rectY = 325 - rectHeight / 2 + offsetY;
    drawings.push({
        x0: rectX,
        y0: rectY,
        x1: rectX + rectWidth,
        y1: rectY,
        color: '#000'
    });
    drawings.push({
        x0: rectX + rectWidth,
        y0: rectY,
        x1: rectX + rectWidth,
        y1: rectY + rectHeight,
        color: '#000'
    });
    drawings.push({
        x0: rectX + rectWidth,
        y0: rectY + rectHeight,
        x1: rectX,
        y1: rectY + rectHeight,
        color: '#000'
    });
    drawings.push({
        x0: rectX,
        y0: rectY + rectHeight,
        x1: rectX,
        y1: rectY,
        color: '#000'
    });

    // Draw circles
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 3; j++) {
            const cx = 100 + i * circleMargin * scale + circleRadius * 2 * i * scale + circleMargin + offsetX;
            const cy = 100 + j * circleMargin * scale + circleRadius * 2 * j * scale + circleMargin + offsetY;

            const circlePoints = generateCircle(cx, cy, circleRadius * scale, 18);

            // Draw the circle
            for (let k = 0; k < circlePoints.length; k++) {
                const point = circlePoints[k];
                const nextPoint = circlePoints[(k + 1) % circlePoints.length];

                drawLine(toScreenX(point.x), toScreenY(point.y), toScreenX(nextPoint.x), toScreenY(nextPoint.y), "#000");
                drawings.push({
                    x0: point.x,
                    y0: point.y,
                    x1: nextPoint.x,
                    y1: nextPoint.y,
                    color: '#000'
                });
            }
        }
    }
}
drawCirclesAndRectangle();

function redrawCanvas() {
    // set the canvas to the size of the window
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < drawings.length; i++) {
        const line = drawings[i];
        drawLine(toScreenX(line.x0), toScreenY(line.y0), toScreenX(line.x1), toScreenY(line.y1), line.color);
    }
}
redrawCanvas();

// draw with selected color
let currentColor = '#000';
function drawLine(x0, y0, x1, y1, color) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 5;
    context.stroke();
}

// if the window changes size, redraw the canvas
window.addEventListener("resize", (event) => {
    redrawCanvas();
});

// Mouse Event Handlers
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', onMouseMove, false);
canvas.addEventListener('wheel', onMouseWheel, false);


// Touch Event Handlers 
canvas.addEventListener('touchstart', onTouchStart);
canvas.addEventListener('touchend', onTouchEnd);
canvas.addEventListener('touchcancel', onTouchEnd);
canvas.addEventListener('touchmove', onTouchMove);


// mouse functions
let leftMouseDown = false;
let rightMouseDown = false;
function onMouseDown(event) {

    // detect left clicks
    if (event.button == 0) {
        leftMouseDown = true;
        rightMouseDown = false;
    }
    // detect right clicks
    if (event.button == 2) {
        rightMouseDown = true;
        leftMouseDown = false;
    }

    // update the cursor coordinates
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;

    cursorX = (event.clientX - rect.left) * scaleX;
    cursorY = (event.clientY - rect.top) * scaleY;
    prevCursorX = cursorX;
    prevCursorY = cursorY;
}

function onMouseMove(event) {
    const { x, y } = getCursorPosition(event);

    // // get mouse position
    const scaledX = toTrueX(x);
    const scaledY = toTrueY(y);
    const prevScaledX = toTrueX(prevCursorX);
    const prevScaledY = toTrueY(prevCursorY);

    if (leftMouseDown) {
        // add the line to drawing history
        drawings.push({
            x0: prevScaledX,
            y0: prevScaledY,
            x1: scaledX,
            y1: scaledY,
            color: currentColor
        })
        // draw a line
        drawLine(prevCursorX, prevCursorY, x, y, currentColor);
    }

    if (rightMouseDown) {
        // move the screen
        offsetX += (x - prevCursorX) / scale;
        offsetY += (y - prevCursorY) / scale;
        redrawCanvas();
    }
    prevCursorX = x;
    prevCursorY = y;
}

function onMouseUp() {
    leftMouseDown = false;
    rightMouseDown = false;
}

function onMouseWheel(event) {
    const deltaY = event.deltaY;
    const scaleAmount = -deltaY / 500;
    scale = scale * (1 + scaleAmount);

    // zoom the page based on where the cursor is
    var distX = event.pageX / canvas.clientWidth;
    var distY = event.pageY / canvas.clientHeight;

    // calculate how much we need to zoom
    const unitsZoomedX = trueWidth() * scaleAmount;
    const unitsZoomedY = trueHeight() * scaleAmount;

    const unitsAddLeft = unitsZoomedX * distX;
    const unitsAddTop = unitsZoomedY * distY;

    offsetX -= unitsAddLeft;
    offsetY -= unitsAddTop;

    redrawCanvas();
}

// touch functions
const prevTouches = [null, null]; // up to 2 touches
let singleTouch = false;
let doubleTouch = false;
function onTouchStart(event) {
    if (event.touches.length == 1) {
        singleTouch = true;
        doubleTouch = false;
    }
    if (event.touches.length >= 2) {
        singleTouch = false;
        doubleTouch = true;
    }

    // store the last touches
    prevTouches[0] = event.touches[0];
    prevTouches[1] = event.touches[1];

}

function onTouchMove(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const touch0X = (event.touches[0].pageX - rect.left) * scaleX;
    const touch0Y = (event.touches[0].pageY - rect.top) * scaleY;
    const prevTouch0X = prevTouches[0] ? (prevTouches[0].pageX - rect.left) * scaleX : touch0X;
    const prevTouch0Y = prevTouches[0] ? (prevTouches[0].pageY - rect.top) * scaleY : touch0Y;

    const scaledX = toTrueX(touch0X);
    const scaledY = toTrueY(touch0Y);
    const prevScaledX = toTrueX(prevTouch0X);
    const prevScaledY = toTrueY(prevTouch0Y);

    if (singleTouch) {
        // add to history
        drawings.push({
            x0: prevScaledX,
            y0: prevScaledY,
            x1: scaledX,
            y1: scaledY,
            color: currentColor
        });
        drawLine(prevTouch0X, prevTouch0Y, touch0X, touch0Y, currentColor);
    }

    if (doubleTouch) {
        // get second touch coordinates
        const touch1X = event.touches[1].pageX;
        const touch1Y = event.touches[1].pageY;
        const prevTouch1X = prevTouches[1].pageX;
        const prevTouch1Y = prevTouches[1].pageY;

        // get midpoints
        const midX = (touch0X + touch1X) / 2;
        const midY = (touch0Y + touch1Y) / 2;
        const prevMidX = (prevTouch0X + prevTouch1X) / 2;
        const prevMidY = (prevTouch0Y + prevTouch1Y) / 2;

        // calculate the distances between the touches
        const hypot = Math.sqrt(Math.pow((touch0X - touch1X), 2) + Math.pow((touch0Y - touch1Y), 2));
        const prevHypot = Math.sqrt(Math.pow((prevTouch0X - prevTouch1X), 2) + Math.pow((prevTouch0Y - prevTouch1Y), 2));

        // calculate the screen scale change
        var zoomAmount = hypot / prevHypot;
        scale = scale * zoomAmount;
        const scaleAmount = 1 - zoomAmount;

        // calculate how many pixels the midpoints have moved in the x and y direction
        const panX = midX - prevMidX;
        const panY = midY - prevMidY;
        // scale this movement based on the zoom level
        offsetX += (panX / scale);
        offsetY += (panY / scale);

        // Get the relative position of the middle of the zoom.
        // 0, 0 would be top left. 
        // 0, 1 would be top right etc.
        var zoomRatioX = midX / canvas.clientWidth;
        var zoomRatioY = midY / canvas.clientHeight;

        // calculate the amounts zoomed from each edge of the screen
        const unitsZoomedX = trueWidth() * scaleAmount;
        const unitsZoomedY = trueHeight() * scaleAmount;

        const unitsAddLeft = unitsZoomedX * zoomRatioX;
        const unitsAddTop = unitsZoomedY * zoomRatioY;

        offsetX += unitsAddLeft;
        offsetY += unitsAddTop;

        redrawCanvas();
    }
    prevTouches[0] = event.touches[0];
    prevTouches[1] = event.touches[1];
}

function onTouchEnd(event) {
    singleTouch = false;
    doubleTouch = false;
}

function changeColor(color) {
    currentColor = color;
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}
