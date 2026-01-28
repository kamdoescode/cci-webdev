const canvas = document.getElementById('canvas');

// generate a random colour for each minute
function randomColor() {
    const h = Math.floor(Math.random() * 360);
    const s = 30 + Math.random() * 20; //30-50% saturation
    const l = 35 + Math.random() * 15; //35-50% lightness
    return `hsl(${h}, ${s}%, ${l}%)`;
}


let lastMinute = null; // stores last recorded minute. start at 0


// checks current minute once per second
function checkTime() {
    const now = new Date();
    const currentMinute = now.getMinutes();

      // first run: draw nothing
    if (lastMinute === null) {
        lastMinute = currentMinute;
        return;
    }

    // record time when minute changes
    if (currentMinute !== lastMinute) {
        lastMinute = currentMinute;
        addMinuteLine();
    }
}

// creates new line and adds to canvas
function addMinuteLine() {
    const line = document.createElement('div');
    line.className = 'minute-line';
    line.style.background = randomColor();
    canvas.appendChild(line);
}

// run the time check each second
setInterval(checkTime, 1000);