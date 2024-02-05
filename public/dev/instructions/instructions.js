// get canvasIns element
const canvasIns = document.getElementById("ins-canvas");
const contextIns = canvasIns.getContext("2d");

// disable right clicking
document.oncontextmenu = function () {
    return false;
}

// list of all strokes drawn
const drawingsIns = [];

// coordinates of mouse cursor
let cursorXIns;
let cursorYIns;
let prevCursorXIns;
let prevCursorYIns;

// distance from origin
let offsetXIns = 0;
let offsetYIns = 0;

// zoom amount
let scaleIns = 1;

// convert coordinates
function toScreenXIns(xTrue) {
    return (xTrue + offsetXIns) * scaleIns;
}
function toScreenYIns(yTrue) {
    return (yTrue + offsetYIns) * scaleIns;
}
function toTrueXIns(xScreen) {
    return (xScreen / scaleIns) - offsetXIns;
}
function toTrueYIns(yScreen) {
    return (yScreen / scaleIns) - offsetYIns;
}
function trueHeightIns() {
    return canvasIns.clientHeight / scaleIns;
}
function trueWidthIns() {
    return canvasIns.clientWidth / scaleIns;
}

function getCursorPositionIns(event) {
    var rectIns = canvasIns.getBoundingClientRect();
    var scaleXIns = canvasIns.width / rectIns.width;
    var scaleYIns = canvasIns.height / rectIns.height;

    return {
        x: (event.clientX - rectIns.left) * scaleXIns,
        y: (event.clientY - rectIns.top) * scaleYIns
    };
}

function redrawCanvasIns() {
    // set the canvasIns to the size of the window
    canvasIns.width = document.body.clientWidth;
    canvasIns.height = document.body.clientHeight;

    contextIns.fillStyle = '#fff';
    contextIns.fillRect(0, 0, canvasIns.width, canvasIns.height);

    for (let i = 0; i < drawingsIns.length; i++) {
        const lineIns = drawingsIns[i];
        drawLineIns(toScreenXIns(lineIns.x0), toScreenYIns(lineIns.y0), toScreenXIns(lineIns.x1), toScreenYIns(lineIns.y1), lineIns.color);
    }
}
redrawCanvasIns();

// draw with selected color
let currentColorIns = '#000';
function drawLineIns(x0, y0, x1, y1, color) {
    contextIns.beginPath();
    contextIns.moveTo(x0, y0);
    contextIns.lineTo(x1, y1);
    contextIns.strokeStyle = color;
    contextIns.lineWidth = 10;
    contextIns.stroke();
}

// if the window changes size, redraw the canvasIns
window.addEventListener("resize", (event) => {
    redrawCanvasIns();
});

// Mouse Event Handlers
canvasIns.addEventListener('mousedown', onMouseDownIns);
canvasIns.addEventListener('mouseup', onMouseUpIns, false);
canvasIns.addEventListener('mouseout', onMouseUpIns, false);
canvasIns.addEventListener('mousemove', onMouseMoveIns, false);
canvasIns.addEventListener('wheel', onMouseWheelIns, false);


// Touch Event Handlers 
canvasIns.addEventListener('touchstart', onTouchStartIns);
canvasIns.addEventListener('touchend', onTouchEndIns);
canvasIns.addEventListener('touchcancel', onTouchEndIns);
canvasIns.addEventListener('touchmove', onTouchMoveIns);


// mouse functions
let leftMouseDownIns = false;
let rightMouseDownIns = false;
function onMouseDownIns(event) {

    // detect left clicks
    if (event.button == 0) {
        leftMouseDownIns = true;
        rightMouseDownIns = false;
    }
    // detect right clicks
    if (event.button == 2) {
        rightMouseDownIns = true;
        leftMouseDownIns = false;
    }

    // update the cursor coordinates
    var rectIns = canvasIns.getBoundingClientRect();
    var scaleXIns = canvasIns.width / rectIns.width;
    var scaleYIns = canvasIns.height / rectIns.height;

    cursorXIns = (event.clientX - rectIns.left) * scaleXIns;
    cursorYIns = (event.clientY - rectIns.top) * scaleYIns;
    prevCursorXIns = cursorXIns;
    prevCursorYIns = cursorYIns;
}

function onMouseMoveIns(event) {
    const { x, y } = getCursorPositionIns(event);

    // // get mouse position
    const scaledXIns = toTrueXIns(x);
    const scaledYIns = toTrueYIns(y);
    const prevScaledXIns = toTrueXIns(prevCursorXIns);
    const prevScaledYIns = toTrueYIns(prevCursorYIns);

    if (leftMouseDownIns) {
        // add the line to drawing history
        drawingsIns.push({
            x0: prevScaledXIns,
            y0: prevScaledYIns,
            x1: scaledXIns,
            y1: scaledYIns,
            color: currentColorIns
        })
        // draw a line
        drawLineIns(prevCursorXIns, prevCursorYIns, x, y, currentColorIns);
    }

    if (rightMouseDownIns) {
        // move the screen
        offsetXIns += (x - prevCursorXIns) / scaleIns;
        offsetYIns += (y - prevCursorYIns) / scaleIns;
        redrawCanvasIns();
    }
    prevCursorXIns = x;
    prevCursorYIns = y;
}

function onMouseUpIns() {
    leftMouseDownIns = false;
    rightMouseDownIns = false;
}

function onMouseWheelIns(event) {
    event.preventDefault();

    const deltaY = event.deltaY;
    const scaleAmountIns = -deltaY / 500;
    scaleIns = scaleIns * (1 + scaleAmountIns);

    // zoom the page based on where the cursor is
    var distX = event.pageX / canvasIns.clientWidth;
    var distY = event.pageY / canvasIns.clientHeight;

    // calculate how much we need to zoom
    const unitsZoomedXIns = trueWidthIns() * scaleAmountIns;
    const unitsZoomedYIns = trueHeightIns() * scaleAmountIns;

    const unitsAddLeftIns = unitsZoomedXIns * distX;
    const unitsAddTopIns = unitsZoomedYIns * distY;

    offsetXIns -= unitsAddLeftIns;
    offsetYIns -= unitsAddTopIns;

    redrawCanvasIns();
}

// touch functions
const prevTouchesIns = [null, null]; // up to 2 touches
let singleTouchIns = false;
let doubleTouchIns = false;
function onTouchStartIns(event) {
    if (event.touches.length == 1) {
        singleTouchIns = true;
        doubleTouchIns = false;
    }
    if (event.touches.length >= 2) {
        singleTouchIns = false;
        doubleTouchIns = true;
    }

    // store the last touches
    prevTouchesIns[0] = event.touches[0];
    prevTouchesIns[1] = event.touches[1];

}

function onTouchMoveIns(event) {
    const rectIns = canvasIns.getBoundingClientRect();
    const scaleXIns = canvasIns.width / rectIns.width;
    const scaleYIns = canvasIns.height / rectIns.height;

    const touch0XIns = (event.touches[0].pageX - rectIns.left) * scaleXIns;
    const touch0YIns = (event.touches[0].pageY - rectIns.top) * scaleYIns;
    const prevTouch0XIns = prevTouchesIns[0] ? (prevTouchesIns[0].pageX - rectIns.left) * scaleXIns : touch0XIns;
    const prevTouch0YIns = prevTouchesIns[0] ? (prevTouchesIns[0].pageY - rectIns.top) * scaleYIns : touch0YIns;

    const scaledXIns = toTrueXIns(touch0XIns);
    const scaledYIns = toTrueYIns(touch0YIns);
    const prevScaledXIns = toTrueXIns(prevTouch0XIns);
    const prevScaledYIns = toTrueYIns(prevTouch0YIns);

    if (singleTouchIns) {
        // add to history
        drawingsIns.push({
            x0: prevScaledXIns,
            y0: prevScaledYIns,
            x1: scaledXIns,
            y1: scaledYIns,
            color: currentColorIns
        });
        drawLineIns(prevTouch0XIns, prevTouch0YIns, touch0XIns, touch0YIns, currentColorIns);
    }

    if (doubleTouchIns) {
        // get second touch coordinates
        const touch1XIns = event.touches[1].pageX;
        const touch1YIns = event.touches[1].pageY;
        const prevTouch1XIns = prevTouchesIns[1].pageX;
        const prevTouch1YIns = prevTouchesIns[1].pageY;

        // get midpoints
        const midXIns = (touch0XIns + touch1XIns) / 2;
        const midYIns = (touch0YIns + touch1YIns) / 2;
        const prevMidXIns = (prevTouch0XIns + prevTouch1XIns) / 2;
        const prevMidYIns = (prevTouch0YIns + prevTouch1YIns) / 2;

        // calculate the distances between the touches
        const hypotIns = Math.sqrt(Math.pow((touch0XIns - touch1XIns), 2) + Math.pow((touch0YIns - touch1YIns), 2));
        const prevHypotIns = Math.sqrt(Math.pow((prevTouch0XIns - prevTouch1XIns), 2) + Math.pow((prevTouch0YIns - prevTouch1YIns), 2));

        // calculate the screen scale change
        var zoomAmountIns = hypotIns / prevHypotIns;
        scaleIns = scaleIns * zoomAmountIns;
        const scaleAmountIns = 1 - zoomAmountIns;

        // calculate how many pixels the midpoints have moved in the x and y directInsion
        const panXIns = midXIns - prevMidXIns;
        const panYIns = midYIns - prevMidYIns;
        // scale this movement based on the zoom level
        offsetXIns += (panXIns / scaleIns);
        offsetYIns += (panYIns / scaleIns);

        // Get the relative position of the middle of the zoom.
        // 0, 0 would be top left. 
        // 0, 1 would be top right etc.
        var zoomRatioXIns = midXIns / canvasIns.clientWidth;
        var zoomRatioYIns = midYIns / canvasIns.clientHeight;

        // calculate the amounts zoomed from each edge of the screen
        const unitsZoomedXIns = trueWidthIns() * scaleAmountIns;
        const unitsZoomedYIns = trueHeightIns() * scaleAmountIns;

        const unitsAddLeftIns = unitsZoomedXIns * zoomRatioXIns;
        const unitsAddTopIns = unitsZoomedYIns * zoomRatioYIns;

        offsetXIns += unitsAddLeftIns;
        offsetYIns += unitsAddTopIns;

        redrawCanvasIns();
    }
    prevTouchesIns[0] = event.touches[0];
    prevTouchesIns[1] = event.touches[1];
}

function onTouchEndIns(event) {
    singleTouchIns = false;
    doubleTouchIns = false;
}

function changeColorIns(color) {
    currentColorIns = color;
}

function toggleFullScreenIns() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}