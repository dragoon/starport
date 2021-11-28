const weatherMap = {
    1: {type: 'severe', intensity: 2.5, icon: 'wi-thunderstorm', name: 'Tropical Storm'}, //tropical storm
    2: {type: 'severe', intensity: 5, icon: 'wi-hurricane', name: 'Hurricane'}, //hurricane
    3: {type: 'severe', intensity: 1.25, icon: 'wi-thunderstorm', name: 'Severe Thunderstorms'}, //severe thunderstorms
    4: {type: 'thunder', intensity: 1, icon: 'wi-thunderstorm', name: 'Thunderstorms'}, //thunderstorms
    5: {type: 'mix-rain-snow', intensity: 1, icon: 'wi-rain-mix', name: 'Mixed Rain and Snow'}, //mixed rain and snow
    6: {type: 'mix-rain-sleet', intensity: 1, icon: 'wi-sleet', name: 'Mixed Rain and Sleet'}, //mixed rain and sleet
    7: {type: 'mix-snow-sleet', intensity: 1, icon: 'wi-sleet', name: 'Mixed Snow and Sleet'}, //mixed snow and sleet
    8: {type: 'rain', intensity: .5, icon: 'wi-rain-mix', name: 'Freezing Drizzle'}, //freezing drizzle
    9: {type: 'rain', intensity: .5, icon: 'wi-sprinkle', name: 'Drizzle'}, //drizzle
    10: {type: 'rain', intensity: 1, icon: 'wi-rain-mix', name: 'Freezing Rain'}, //freezing rain
    11: {type: 'rain', intensity: 1, icon: 'wi-rain', name: 'Showers'}, //showers
    14: {type: 'snow', intensity: .75, icon: 'wi-snow', name: 'Light Snow Showers'}, //light snow showers
    16: {type: 'snow', intensity: 1, icon: 'wi-snow', name: 'Snow'}, //snow
    17: {type: 'hail', intensity: 1.5, icon: 'wi-hail', name: 'Hail'}, //hail
    18: {type: 'sleet', intensity: 1, icon: 'wi-sleet', name: 'Sleet'}, //sleet
    19: {type: 'haze', intensity: .5, icon: 'wi-sandstorm', name: 'Dust'}, //dust
    20: {type: 'haze', intensity: .5, icon: 'wi-fog', name: 'Foggy'}, //foggy
    22: {type: 'smoke', intensity: .5, icon: 'wi-smoke', name: 'Smokey'}, //smoky
    23: {type: 'wind', intensity: 3, icon: 'wi-cloudy-gusts', name: 'Blustery'}, //blustery
    24: {type: 'wind', intensity: 1, icon: 'wi-strong-wind', name: 'Windy'}, //windy
    25: {type: 'sun', intensity: 1, icon: 'wi-snowflake-cold', name: 'Cold'}, //cold
    26: {type: 'cloud', intensity: 1, icon: 'wi-cloudy', name: 'Cloudy'}, //cloudy
    28: {type: 'cloud', intensity: .3, icon: 'wi-day-cloudy', name: 'Mosty Cloudy'}, //mostly cloudy (day)
    30: {type: 'cloud', intensity: .1, icon: 'wi-day-cloudy', name: 'Partly Cloudy'}, //partly cloudy (day)
    31: {type: 'sun', intensity: 1, icon: 'wi-night-clear', name: 'Clear'}, //clear (night)
    35: {type: 'hail', intensity: 1, icon: 'wi-hail', name: 'Mixed Rain and Hail'}, //mixed rain and hail
    37: {type: 'thunder', intensity: .25, icon: 'wi-storm-showers', name: 'Isolated Thunderstorms'}, //isolated thunderstorms
    38: {type: 'thunder', intensity: .5, icon: 'wi-storm-showers', name: 'Scattered Thunderstorms'}, //scattered thunderstorms
    39: {type: 'thunder', intensity: .5, icon: 'wi-storm-showers', name: 'Scattered Thunderstorms'}, //scattered thunderstorms
    40: {type: 'rain', intensity: .75, icon: 'wi-showers', name: 'Scattered Showers'}, //scattered showers
    41: {type: 'snow', intensity: 1.75, icon: 'wi-snow', name: 'Heavy Snow'}, //heavy snow
    42: {type: 'snow', intensity: .5, icon: 'wi-snow', name: 'Scattered Snow Showers'}, //scattered snow showers
    44: {type: 'cloud', intensity: .1, icon: 'wi-day-cloudy', name: 'Partly Cloudy'}, //partly cloudy
    45: {type: 'thunder', intensity: .5, icon: 'wi-storm-showers', name: 'Thundershowers'}, //thundershowers
    46: {type: 'snow', intensity: .75, icon: 'wi-snow', name: 'Snow Showers'}, //snow showers
    47: {type: 'thunder', intensity: .25, icon: 'wi-storm-showers', name: 'Isolated Thunderstorms'} //isolated thundershowers
};

const manager = new WeatherManager();

manager.init();
getLocation();

window.addEventListener('resize', function(event) {
    manager.resize();
}, true);

requestAnimationFrame(tick);


$('#time_of_day_range').on('input', function () {
    // set time of day
    let minutes = $(this).val();
    let date = new Date();
    date.setHours(minutes / 60);
    date.setMinutes(minutes % 60);
    dateService = new DateService(date);
    manager.adaptToDaytime();
});

function addExtras(extras) {
}

function changeWeather(data, card_id) {
    manager.weatherJson.daily[card_id].ui_params = {
            "type": data.type,
            "intensity": data.intensity,
            "name": data.name
        };
    manager.setWeather(manager.weatherJson);
}