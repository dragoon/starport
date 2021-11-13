const weatherMap = {
    0: {type: 'severe', class: '', intensity: 5, icon: 'wi-tornado', name: 'Tornado'},
    1: {type: 'severe', class: '', intensity: 2.5, icon: 'wi-thunderstorm', name: 'Tropical Storm'}, //tropical storm
    2: {type: 'severe', class: '', intensity: 5, icon: 'wi-hurricane', name: 'Hurricane'}, //hurricane
    3: {type: 'severe', class: '', intensity: 1.25, icon: 'wi-thunderstorm', name: 'Severe Thunderstorms'}, //severe thunderstorms
    4: {type: 'thunder', class: '', intensity: 1, icon: 'wi-thunderstorm', name: 'Thunderstorms'}, //thunderstorms
    5: {type: 'mix-rain-snow', class: 'cold', intensity: 1, icon: 'wi-rain-mix', name: 'Mixed Rain and Snow'}, //mixed rain and snow
    6: {type: 'mix-rain-sleet', class: 'cold', intensity: 1, icon: 'wi-sleet', name: 'Mixed Rain and Sleet'}, //mixed rain and sleet
    7: {type: 'mix-snow-sleet', class: 'cold', intensity: 1, icon: 'wi-sleet', name: 'Mixed Snow and Sleet'}, //mixed snow and sleet
    8: {type: 'rain', class: 'cold', intensity: .5, icon: 'wi-rain-mix', name: 'Freezing Drizzle'}, //freezing drizzle
    9: {type: 'rain', class: '', intensity: .5, icon: 'wi-sprinkle', name: 'Drizzle'}, //drizzle
    10: {type: 'rain', class: 'cold', intensity: 1, icon: 'wi-rain-mix', name: 'Freezing Rain'}, //freezing rain
    11: {type: 'rain', class: '', intensity: 1, icon: 'wi-rain', name: 'Showers'}, //showers
    12: {type: 'rain', class: '', intensity: 1, icon: 'wi-rain', name: 'Showers'}, //showers
    13: {type: 'snow', class: 'cold', intensity: .5, icon: 'wi-snow', name: 'Snow Flurries'}, //snow flurries
    14: {type: 'snow', class: 'cold', intensity: .75, icon: 'wi-snow', name: 'Light Snow Showers'}, //light snow showers
    15: {type: 'snow', class: 'cold', intensity: .5, icon: 'wi-snow', name: 'Blowing Snow'}, //blowing snow
    16: {type: 'snow', class: 'cold', intensity: 1, icon: 'wi-snow', name: 'Snow'}, //snow
    17: {type: 'hail', class: '', intensity: 1.5, icon: 'wi-hail', name: 'Hail'}, //hail
    18: {type: 'sleet', class: 'cold', intensity: 1, icon: 'wi-sleet', name: 'Sleet'}, //sleet
    19: {type: 'haze', class: 'hot', intensity: .5, icon: 'wi-sandstorm', name: 'Dust'}, //dust
    20: {type: 'haze', class: '', intensity: .5, icon: 'wi-fog', name: 'Foggy'}, //foggy
    21: {type: 'haze', class: '', intensity: .5, icon: 'wi-fog', name: 'Haze'}, //haze
    22: {type: 'smoke', class: '', intensity: .5, icon: 'wi-smoke', name: 'Smokey'}, //smoky
    23: {type: 'wind', class: '', intensity: 3, icon: 'wi-cloudy-gusts', name: 'Blustery'}, //blustery
    24: {type: 'wind', class: '', intensity: 1, icon: 'wi-strong-wind', name: 'Windy'}, //windy
    25: {type: 'sun', class: 'cold', intensity: 1, icon: 'wi-snowflake-cold', name: 'Cold'}, //cold
    26: {type: 'cloud', class: '', intensity: 1, icon: 'wi-cloudy', name: 'Cloudy'}, //cloudy
    27: {type: 'cloud', class: 'night', intensity: .3, icon: 'wi-night-cloudy', name: 'Mosty Cloudy'}, //mostly cloudy (night)
    28: {type: 'cloud', class: '', intensity: .3, icon: 'wi-day-cloudy', name: 'Mosty Cloudy'}, //mostly cloudy (day)
    29: {type: 'cloud', class: 'night', intensity: .1, icon: 'wi-night-cloudy', name: 'Partly Cloudy'}, //partly cloudy (night)
    30: {type: 'cloud', class: '', intensity: .1, icon: 'wi-day-cloudy', name: 'Partly Cloudy'}, //partly cloudy (day)
    31: {type: 'sun', class: 'night', intensity: 1, icon: 'wi-night-clear', name: 'Clear'}, //clear (night)
    32: {type: 'sun', class: '', intensity: 1, icon: 'wi-day-sunny', name: 'Sunny'}, //sunny
    33: {type: 'sun', class: 'night', intensity: 1, icon: 'wi-night-clear', name: 'Fair'}, //fair (night)
    34: {type: 'sun', class: '', intensity: 1, icon: 'wi-day-sunny', name: 'Fair'}, //fair (day)
    35: {type: 'hail', class: '', intensity: 1, icon: 'wi-hail', name: 'Mixed Rain and Hail'}, //mixed rain and hail
    36: {type: 'sun', class: 'hot', intensity: 1, icon: 'wi-day-sunny', name: 'Hot'}, //hot
    37: {type: 'thunder', class: '', intensity: .25, icon: 'wi-storm-showers', name: 'Isolated Thunderstorms'}, //isolated thunderstorms
    38: {type: 'thunder', class: '', intensity: .5, icon: 'wi-storm-showers', name: 'Scattered Thunderstorms'}, //scattered thunderstorms
    39: {type: 'thunder', class: '', intensity: .5, icon: 'wi-storm-showers', name: 'Scattered Thunderstorms'}, //scattered thunderstorms
    40: {type: 'rain', class: '', intensity: .75, icon: 'wi-showers', name: 'Scattered Showers'}, //scattered showers
    41: {type: 'snow', class: 'cold', intensity: 1.75, icon: 'wi-snow', name: 'Heavy Snow'}, //heavy snow
    42: {type: 'snow', class: 'cold', intensity: .5, icon: 'wi-snow', name: 'Scattered Snow Showers'}, //scattered snow showers
    44: {type: 'cloud', class: '', intensity: .1, icon: 'wi-day-cloudy', name: 'Partly Cloudy'}, //partly cloudy
    45: {type: 'thunder', class: '', intensity: .5, icon: 'wi-storm-showers', name: 'Thundershowers'}, //thundershowers
    46: {type: 'snow', class: 'cold', intensity: .75, icon: 'wi-snow', name: 'Snow Showers'}, //snow showers
    47: {type: 'thunder', class: '', intensity: .25, icon: 'wi-storm-showers', name: 'Isolated Thunderstorms'} //isolated thundershowers
};


// we don't want automatic updates
clearInterval(funcDayTimeUpdates);

$('#time_of_day_range').on('input', function () {
    // set time of day
    var minutes = $(this).val();
    var date = new Date();
    date.setHours(minutes / 60);
    date.setMinutes(minutes % 60);
    dateService = new DateService(date);
    adaptToDaytime(cards, currentWeather);
});