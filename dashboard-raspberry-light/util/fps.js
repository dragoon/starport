let fps;
const times = [];
let start;

// adapted from https://www.growingwiththeweb.com/2017/12/fast-simple-js-fps-counter.html

function tick_fps(timestamp) {
    if (start === undefined)
        start = timestamp;
    const elapsed = timestamp - start;

    // check fps rate
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
    }
    times.push(now);
    fps = times.length;
    if (elapsed > 1000) {
        document.getElementById('fps-monitor').innerText = fps + " FPS";
        start = timestamp;
    }
    requestAnimationFrame(tick_fps);
}

requestAnimationFrame(tick_fps);

