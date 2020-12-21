const weather_types = ["snow", "mix", "mix-rain-sleet", "mix-rain-snow", "mix-snow-sleet", "sleet", "wind", "rain", "hail", "thunder", "severe", "cloud", "sun", "haze", "smoke"];
const classes = ['night', 'day', 'hot', 'cold'];

var weatherMap = {
    0: {type: 'severe', class: '', intensity: 5, icon: 'wi-tornado', name: 'Tornado'},
    1: {type: 'severe', class: '', intensity: 2.5, icon: 'wi-thunderstorm', name: 'Tropical Storm'}, //tropical storm
    2: {type: 'severe', class: '', intensity: 5, icon: 'wi-hurricane', name: 'Hurricane'}, //hurricane
    4: {type: 'thunder', class: '', intensity: 1, icon: 'wi-thunderstorm', name: 'Thunderstorms'}, //thunderstorms
    5: {type: 'mix-rain-snow', class: 'cold', intensity: 1, icon: 'wi-rain-mix', name: 'Mixed Rain and Snow'}, //mixed rain and snow
    6: {type: 'mix-rain-sleet', class: 'cold', intensity: 1, icon: 'wi-sleet', name: 'Mixed Rain and Sleet'}, //mixed rain and sleet
    7: {type: 'mix-snow-sleet', class: 'cold', intensity: 1, icon: 'wi-sleet', name: 'Mixed Snow and Sleet'}, //mixed snow and sleet
    17: {type: 'hail', class: '', intensity: 1.5, icon: 'wi-hail', name: 'Hail'}, //hail
    18: {type: 'sleet', class: 'cold', intensity: 1, icon: 'wi-sleet', name: 'Sleet'},
    23: {type: 'wind', class: '', intensity: 3, icon: 'wi-cloudy-gusts', name: 'Blustery'}, //blustery
    24: {type: 'wind', class: '', intensity: 1, icon: 'wi-strong-wind', name: 'Windy'}, //windy
    35: {type: 'hail', class: '', intensity: 1, icon: 'wi-hail', name: 'Mixed Rain and Hail'}, //mixed rain and hail
    37: {type: 'thunder', class: '', intensity: .25, icon: 'wi-storm-showers', name: 'Isolated Thunderstorms'}, //isolated thunderstorms
    38: {type: 'thunder', class: '', intensity: .5, icon: 'wi-storm-showers', name: 'Scattered Thunderstorms'}, //scattered thunderstorms
    39: {type: 'thunder', class: '', intensity: .5, icon: 'wi-storm-showers', name: 'Scattered Thunderstorms'}, //scattered thunderstorms
    45: {type: 'thunder', class: '', intensity: .5, icon: 'wi-storm-showers', name: 'Thundershowers'}, //thundershowers
    47: {type: 'thunder', class: '', intensity: .25, icon: 'wi-storm-showers', name: 'Isolated Thunderstorms'} //isolated thundershowers
};


// 📝 Fetch all DOM nodes in jQuery and Snap SVG
$(function () {

    var cards = $('.container').toArray().map(c => new WeatherCard(c));

    function onGetLocation() {
        cards.forEach((card, i) => {
                card.updateTempText(0, "°C");
                card.updateDateText(new Date());
                var ui_params;
                if (i===0) {
                    ui_params = {
                    "type": "snow",
                    "intensity": 1,
                    "name": "Snow",
                    "classes": []
                    }
                } else if (i===1) {
                    ui_params = {
                    "type": "severe",
                    "intensity": 2,
                    "name": "T Storms",
                    "classes": []
                    }
                } else if (i===2) {
                    ui_params = {
                    "type": "wind",
                    "intensity": 2,
                    "name": "Wind",
                    "classes": []
                    }
                }
                else if (i===3) {
                    ui_params = {
                    "type": "fog",
                    "intensity": 1,
                    "name": "Fog",
                    "classes": []
                    }
                }
                else {
                    ui_params = {
                    "type": "sun",
                    "intensity": 1,
                    "name": "Sun",
                    "classes": []
                    }
                }
                card.changeWeather(ui_params);
            });
    }

    function init() {
        onResize();
        cards.forEach(card => card.init());
        onGetLocation();
    }

    function onResize() {
        cards.forEach(card => card.resize());
    }

    function tick() {
        // iterate over all weather cards
        cards.forEach(card => card.tick());
        requestAnimationFrame(tick);
    }

    init();
    $(window).resize(onResize);
    requestAnimationFrame(tick);

});
