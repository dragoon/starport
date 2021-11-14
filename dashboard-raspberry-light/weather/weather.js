gsap.registerPlugin(PixiPlugin, MotionPathPlugin);
const weather_types = ["snow", "mix", "mix-rain-sleet", "mix-rain-snow", "mix-snow-sleet", "sleet", "wind", "rain", "hail", "thunder", "severe", "cloud", "sun", "haze", "smoke"];

const hot_color = 0xe6b3b3;
const cold_color = 0xccdffb;
const normal_color = 0xccccff;

const nightColorConfig = {
    "brightnessLevel": 0,
    "cloud1": 0x00002e, "cloud1Opacity": 1,
    "cloud2": 0x434a63, "cloud2Opacity": 0.6,
    "cloud3": 0x3f3d4c, "cloud3Opacity": 0.6,
    "textColor": 0xdddddd,
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
 * @param colorConfig {{brightnessLevel: number, cloud1: number, cloud2: number, cloud3: number, textColor: number, night: boolean}}
 * @param sunriseTimestamp timestamp (seconds since epoch) of sunrise
 * @param sunsetTimestamp timestamp (seconds since epoch) of sunset
 * @return {{y: number, cloud1: number}}
 */
function adaptColorToDaytime(colorConfig, sunriseTimestamp, sunsetTimestamp) {
    // get current time in seconds
    let now = dateService.getDate().getTime()/1000;
    const twilightSeconds = 30 * 60;
    if (now < sunriseTimestamp - twilightSeconds || now > sunsetTimestamp + twilightSeconds) {
        // copy of night
        return {...nightColorConfig};
    } else if (now > sunriseTimestamp + twilightSeconds && now < sunsetTimestamp - twilightSeconds) {
        // day
        colorConfig.brightnessLevel = 1.0;
        return colorConfig;
    } else {
        // compute percentage to make darker
        const brightnessLevel = Math.min(
            Math.abs( now + twilightSeconds - sunriseTimestamp),
            Math.abs(now - twilightSeconds - sunsetTimestamp)) / (2*twilightSeconds);
        // 0 -- dark , 1 - bright
        console.log("Brightness Level:", brightnessLevel);

        // cloud colors have several stops during twilight
        if (brightnessLevel < 0.25) {
            colorConfig.cloud1 = interpolateColor(0xa62929, nightColorConfig.cloud1, 1-brightnessLevel*4);
            colorConfig.cloud2 = interpolateColor(0xc78585, nightColorConfig.cloud2, 1-brightnessLevel*4);
            colorConfig.cloud3 = interpolateColor(0x8a5b5b, nightColorConfig.cloud3, 1-brightnessLevel*4);
        } else {
            colorConfig.cloud1 = interpolateColor(colorConfig.cloud1, 0xa62929, (1-brightnessLevel)*4/3);
            colorConfig.cloud2 = interpolateColor(colorConfig.cloud2, 0xc78585, (1-brightnessLevel)*4/3);
            colorConfig.cloud3 = interpolateColor(colorConfig.cloud3, 0x8a5b5b, (1-brightnessLevel)*4/3);
        }
        colorConfig.textColor = interpolateColor(colorConfig.textColor, nightColorConfig.textColor, 1-brightnessLevel);
        colorConfig.cloud2Opacity = nightColorConfig.cloud2Opacity + (1-nightColorConfig.cloud2Opacity)*brightnessLevel;
        colorConfig.cloud3Opacity = nightColorConfig.cloud3Opacity + (1-nightColorConfig.cloud3Opacity)*brightnessLevel;

        // sun position
        colorConfig.brightnessLevel = brightnessLevel;
        if (now <= sunriseTimestamp || now >= sunsetTimestamp) {
            colorConfig.night = true;
        }
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
 * cloud2: number,
 * cloud1: number,
 * cloud3: number}}
 */
function adaptColorToWeather(tempColor, weatherType) {

    let cloud1Color = 0xefefef;
    let cloud2Color = 0xE6E6E6;
    let cloud3Color = 0xD5D5D5;
    let cloud1Opacity = 1;
    let cloud2Opacity = 1;
    let cloud3Opacity = 1;

    switch (weatherType) {
        case "rain":
            tempColor = 0xdcdcdc;
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
        case "snow":
            cloud1Color = 0xfcfcff;
            cloud2Color = 0xfcfcff;
            cloud3Color = 0xfcfcff;
            cloud2Opacity = 0.5;
            cloud3Opacity = 0.5;
            break;
    }

    return {
        "cloud1": cloud1Color, "cloud1Opacity": cloud1Opacity,
        "cloud2": cloud2Color, "cloud2Opacity": cloud2Opacity,
        "cloud3": cloud3Color, "cloud3Opacity": cloud3Opacity,
        "textColor": 0x888888,
    }
}

function computeColorConfig(weatherObj) {
    const tempColor = getTemperatureColor(weatherObj.temp);
    const weatherColors = adaptColorToWeather(tempColor, weatherObj["ui_params"]["type"]);
    const timeColors = adaptColorToDaytime(weatherColors, weatherObj.sunrise, weatherObj.sunset);
    timeColors.textColor = numberToHexString(timeColors.textColor);
    return timeColors;

}

let cards;
let funcDayTimeUpdates;
let currentWeather;

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


/**
 * Return brightness level to properly set update frequency
 * @return number
 */
function adaptToDaytime(cards, day_weather) {
    const colorMap = computeColorConfig(day_weather);
    const canvases = Array.from(document.querySelectorAll(".canvas"));
    canvases.forEach((c) => c.style.color = colorMap.textColor);
    cards.forEach(card => {
        card.clouds[0].tint = colorMap.cloud1;
        card.clouds[0].alpha = colorMap.cloud1Opacity;
        card.clouds[1].tint = colorMap.cloud2;
        card.clouds[1].alpha = colorMap.cloud2Opacity;
        card.clouds[2].tint = colorMap.cloud3;
        card.clouds[2].alpha = colorMap.cloud3Opacity;
    });
    updateSunrise(colorMap.brightnessLevel);
    if (colorMap["night"] === true) {
        canvases.forEach((c) => c.classList.add("night"));
    } else {
        canvases.forEach((c) => c.classList.remove("night"));
    }
    return colorMap.brightnessLevel;
}

function updateUpdateCurWeather(currentWeather) {
    document.querySelector(".datetime-container .cur-temp").innerHTML = Math.round(currentWeather.temp);
    document.querySelector(".datetime-container .cur-wind").innerHTML = Math.round(currentWeather.wind_speed*3.6);
}


function onGetLocation(position) {
    const weather_url = `https://transport-api.herokuapp.com/v1/weather/forecast/daily?lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
    fetch(weather_url)
        .then(response => response.json())
        .then(function (weather) {
            cards.forEach((card, i) => {
                let dayWeather = weather.daily[i];
                card.updateTempText(dayWeather.temp);
                if (i === 0) {
                    currentWeather = dayWeather;
                    updateUpdateCurWeather(weather.current);
                    var brightness = adaptToDaytime(cards, currentWeather);
                    clearInterval(funcDayTimeUpdates);
                    if (brightness < 0.01 || brightness > 0.99) {
                        funcDayTimeUpdates = setInterval(adaptToDaytime, 60 * 1000, cards, currentWeather);
                    } else {
                        // every 10 sec update if sunset/sunrise
                        funcDayTimeUpdates = setInterval(adaptToDaytime, 10 * 1000, cards, currentWeather);
                    }
                }
                card.updateDateText(new Date(dayWeather.dt * 1000));
                card.changeWeather({
                    "type": dayWeather.ui_params.type,
                    "intensity": dayWeather.ui_params.intensity,
                    "name": dayWeather.ui_params.name,
                    "classes": dayWeather.ui_params.classes
                });
            });
            addExtras(weather.extras);
        });
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onGetLocation, function error(message) {
            console.log(message);
            // Zurich default
            onGetLocation({"coords": {"latitude": 47.3386721, "longitude": 8.5198395}})
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}



gsap.registerPlugin(PixiPlugin);
cards = Array.from(document.querySelectorAll('.container')).map(c => new WeatherCard(c));

function init() {
    cards.forEach(card => card.resize());
    cards.forEach(card => card.init());
    getLocation();
}

function tick(timestamp) {
    // iterate over all weather cards
    cards.forEach(card => card.tick(timestamp));
    requestAnimationFrame(tick);
}

init();

window.addEventListener('resize', function(event) {
    cards.forEach(card => card.resize());
}, true);
requestAnimationFrame(tick);
setInterval(getLocation, 60 * 60 * 1000); // 1 hour

