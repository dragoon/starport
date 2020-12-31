let fps;
const times = [];
let start;

// from https://www.growingwiththeweb.com/2017/12/fast-simple-js-fps-counter.html
$(function () {

    function tick(timestamp) {
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
            $('#fps-monitor').text(fps + " FPS");
            start = timestamp;
        }
        requestAnimationFrame(tick);
    }

    $('body').append('<div id="fps-monitor" style="position: absolute;bottom: 0;right: 0;color: #8B8E98;margin-right: 10px;margin-bottom: 10px;"></div>');
    requestAnimationFrame(tick);

});
