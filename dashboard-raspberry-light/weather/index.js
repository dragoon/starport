const manager = new WeatherManager();

manager.init();
getLocation();

window.addEventListener('resize', function(event) {
    manager.resize();
}, true);

requestAnimationFrame(tick);
setInterval(getLocation, 60 * 60 * 1000); // 1 hour