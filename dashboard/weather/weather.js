const weather_types = ["snow", "mix", "mix-rain-sleet", "mix-rain-snow", "mix-snow-sleet", "sleet", "wind", "rain", "hail", "thunder", "severe", "cloud", "sun", "haze", "smoke"]
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

    const cards = $('.container').toArray().map(c => new WeatherCard(c));

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onGetLocation, function error(message) {
                console.log(message);
                onGetLocation({"coords": {"latitude": 47.3386721, "longitude": 8.5198395}})
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }

    function onGetLocation(position) {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const weather_url = `https://dashboard25.p.rapidapi.com/v1/weather/forecast/daily?lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
        fetch(weather_url, {
        headers: {
            'X-RapidAPI-Key': `${token}`,
            'X-RapidAPI-Host': 'dashboard25.p.rapidapi.com'
        }
    })
        .then(response => response.json())
        .then(function (weather) {
            cards.forEach((card, i) => {
                let day_weather;
                if (i===0) {
                    day_weather = weather.current;
                    card.updateTempText({"day": day_weather.temp, "min": weather.daily[i].temp.min});
                } else {
                    day_weather = weather.daily[i];
                    card.updateTempText(day_weather.temp);
                }
                card.updateDateText(new Date(day_weather.dt * 1000));
                card.changeWeather({
                    "type": day_weather.ui_params.type,
                    "intensity": day_weather.ui_params.intensity,
                    "name": day_weather.ui_params.name,
                    "classes": day_weather.ui_params.classes
                });
            });
        });
    }

    function init() {
        onResize();
        cards.forEach(card => card.init());
        getLocation();
    }

    function onResize() {
        cards.forEach(card => card.resize());
    }

    function tick(timestamp) {
        // iterate over all weather cards
        cards.forEach(card => card.tick(timestamp));
        requestAnimationFrame(tick);
    }

    init();
    $(window).resize(onResize);
    requestAnimationFrame(tick);
    setTimeout(getLocation, 60*60*1000); // 1 hour

});
