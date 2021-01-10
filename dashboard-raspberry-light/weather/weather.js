const weather_types = ["snow", "mix", "mix-rain-sleet", "mix-rain-snow", "mix-snow-sleet", "sleet", "wind", "rain", "hail", "thunder", "severe", "cloud", "sun", "haze", "smoke"];

const hot_color = 0xe6b3b3;
const cold_color = 0xccdffb;
const normal_color = 0xccccff;

const nightColorConfig = {
    "top": 0x000000, "bottom": 0x000046,
    "cloud1": 0x00002e, "cloud1Opacity": 1,
    "cloud2": 0x4f525c, "cloud2Opacity": 0.6,
    "cloud3": 0x3f3d4c, "cloud3Opacity": 0.6,
    "night": true
};

/**
 *
 * @param currentTemperature in Celsius
 * @return Number: color as int
 */
function getTemperatureColor(currentTemperature) {
    if (currentTemperature >= 30) {
        return hot_color;
    } else if (currentTemperature >= 15) { // 15 - 30
        return interpolateColor(normal_color, hot_color, (currentTemperature - 15) / 15);
    } else if (currentTemperature <= 0) {
        return cold_color;
    } else if (currentTemperature < 15) {  // 0 - 15
        return interpolateColor(cold_color, normal_color, (currentTemperature) / 15);
    }

    return normal_color;
}


/**
 * Makes color darker according to the time between sunset and sunrise.
 *    _____
 *   /     \
 * _/       \____
 * @param colorConfig {{}}
 * @param sunriseTimestamp timestamp (seconds since epoch) of sunrise
 * @param sunsetTimestamp timestamp (seconds since epoch) of sunset
 * @param now current time (seconds since epoch)
 * @return {{top: number, bottom: number}}
 */
function adaptColorToDaytime(colorConfig, sunriseTimestamp, sunsetTimestamp, now) {
    const hourSeconds = 60 * 60;
    if (now < sunriseTimestamp - hourSeconds || now > sunsetTimestamp + hourSeconds) {
        // copy of night
        return {...nightColorConfig};
    } else if (now > sunriseTimestamp + hourSeconds && now < sunsetTimestamp - hourSeconds) {
        // day
        return colorConfig;
    } else {
        // TWILIGHT!
        const hslColor = hexToHsl(colorConfig.bottom);
        // compute percentage to make darker
        const darknessLevel = Math.min(
            Math.abs( now + hourSeconds - sunriseTimestamp),
            Math.abs(now - hourSeconds - sunsetTimestamp)) / (2*hourSeconds);

        // first color bottom gradient
        colorConfig.bottom = hslToHex(hslColor.h, hslColor.s, hslColor.l * darknessLevel);
        // top gradient -- darker
        colorConfig.top = hslToHex(hslColor.h, hslColor.s, hslColor.l * (darknessLevel - darknessLevel/2));
        colorConfig.cloud1 = interpolateColor(colorConfig.cloud1, nightColorConfig.cloud1, 1-darknessLevel);
        colorConfig.cloud2 = interpolateColor(colorConfig.cloud2, nightColorConfig.cloud2, 1-darknessLevel);
        colorConfig.cloud3 = interpolateColor(colorConfig.cloud3, nightColorConfig.cloud3, 1-darknessLevel);
        return colorConfig;
    }
}

/**
 *
 * @param tempColor: number
 * @param weatherType: string
 * @return {{cloud2Opacity: number,
 * cloud3Opacity: number,
 * cloud1Opacity: number,
 * top: Number, bottom: Number,
 * cloud2: number,
 * cloud1: number,
 * cloud3: number}}
 */
function adaptColorToWeather(tempColor, weatherType) {

    switch (weatherType) {
        case "rain":
            tempColor = 0xD8D8D8;
            break;
        case "haze":
            tempColor = 0xefefef;
            break;
        case "hail":
            tempColor = 0x9FA4AD;
            break;
        case "severe":
            tempColor = 0x9FA4AD;
            break;
        case "thunder":
            tempColor = 0x9FA4AD;
            break;
    }

    // day config
    const hslColor = hexToHsl(tempColor);

    return {
        "top": hslToHex(hslColor.h, hslColor.s, Math.min(1, hslColor.l * 2)), "bottom": tempColor,
        "cloud1": 0xefefef, "cloud1Opacity": 1,
        "cloud2": 0xE6E6E6, "cloud2Opacity": 1,
        "cloud3": 0xD5D5D5, "cloud3Opacity": 1
    }
    // TODO: rain or clouds -- more grey color #d8d8d8
}

function computeBackgroundColor(weatherObj) {
    const tempColor = getTemperatureColor(weatherObj.temp);
    const weatherColors = adaptColorToWeather(tempColor, weatherObj["ui_params"]["type"]);
    const timeColors = adaptColorToDaytime(weatherColors, weatherObj.sunrise, weatherObj.sunset, weatherObj.dt);
    timeColors.top = "#" + timeColors.top.toString(16).padStart(6, '0');
    timeColors.bottom = "#" + timeColors.bottom.toString(16).padStart(6, '0');
    timeColors.cloud1 = "#" + timeColors.cloud1.toString(16).padStart(6, '0');
    timeColors.cloud2 = "#" + timeColors.cloud2.toString(16).padStart(6, '0');
    timeColors.cloud3 = "#" + timeColors.cloud3.toString(16).padStart(6, '0');
    return timeColors;

}


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
    43: {type: 'snow', class: 'cold', intensity: 1.75, icon: 'wi-snow', name: 'Heavy Snow'}, //heavy snow
    44: {type: 'cloud', class: '', intensity: .1, icon: 'wi-day-cloudy', name: 'Partly Cloudy'}, //partly cloudy
    45: {type: 'thunder', class: '', intensity: .5, icon: 'wi-storm-showers', name: 'Thundershowers'}, //thundershowers
    46: {type: 'snow', class: 'cold', intensity: .75, icon: 'wi-snow', name: 'Snow Showers'}, //snow showers
    47: {type: 'thunder', class: '', intensity: .25, icon: 'wi-storm-showers', name: 'Isolated Thunderstorms'} //isolated thundershowers
};

let cards;

function changeWeather(data) {
        cards.forEach((card, i) => {
            card.changeWeather({
                "type": data.type,
                "intensity": data.intensity,
                "name": data.name,
                "classes": [data.class]
            });
        });
    }


function onGetLocation(position) {
    const weather_url = `https://transport-api.herokuapp.com/v1/weather/forecast/daily?lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
    $.getJSON(weather_url).done(function (weather) {

        cards.forEach((card, i) => {
            let day_weather;
            if (i === 0) {
                day_weather = weather.current;
                card.updateTempText({"day": day_weather.temp, "min": weather.daily[i].temp.min});
                // set current background color temperature
                const colorMap = computeBackgroundColor(day_weather);
                $(".sky").css("background", `linear-gradient(to top, ${colorMap.bottom} 0%, ${colorMap.top} 100%)`);
                $(".weather #cloud1").css("fill", `${colorMap.cloud1}`);
                $(".weather #cloud2").css("fill", `${colorMap.cloud2}`);
                $(".weather #cloud3").css("fill", `${colorMap.cloud3}`);
                if (colorMap["night"] === true) {
                    $(".canvas").addClass("night");
                }
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


// 📝 Fetch all DOM nodes in jQuery and Snap SVG
$(function () {
    gsap.registerPlugin(PixiPlugin);

    cards = $('.container').toArray().map(c => new WeatherCard(c));

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
    setTimeout(getLocation, 60 * 60 * 1000); // 1 hour

});
