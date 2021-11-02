gsap.registerPlugin(PixiPlugin, MotionPathPlugin);
const weather_types = ["snow", "mix", "mix-rain-sleet", "mix-rain-snow", "mix-snow-sleet", "sleet", "wind", "rain", "hail", "thunder", "severe", "cloud", "sun", "haze", "smoke"];

const hot_color = 0xe6b3b3;
const cold_color = 0xccdffb;
const normal_color = 0xccccff;

const nightColorConfig = {
    "brightnessLevel": 0,
    "cloud1": 0x00002e, "cloud1Opacity": 1,
    "cloud2": 0x4f525c, "cloud2Opacity": 0.6,
    "cloud3": 0x3f3d4c, "cloud3Opacity": 0.6,
    "detailsTextColor": 0xdddddd,
    "dateTextColor": 0xdddddd,
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
 * @param colorConfig {{brightnessLevel: number, cloud1: number, cloud2: number, cloud3: number, dateTextColor: number, night: boolean}}
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

        // sun position
        colorConfig.brightnessLevel = brightnessLevel;

        // if sunset -- set clouds to night colors
        if (now > sunsetTimestamp - twilightSeconds) {
            colorConfig.cloud1 = nightColorConfig.cloud1;
            colorConfig.cloud2 = nightColorConfig.cloud2;
            colorConfig.cloud3 = nightColorConfig.cloud3;
            colorConfig.cloud2Opacity = nightColorConfig.cloud2Opacity;
            colorConfig.cloud3Opacity = nightColorConfig.cloud3Opacity;
            colorConfig.detailsTextColor = nightColorConfig.detailsTextColor;
        }
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
        "dateTextColor": 0x888888,
        "detailsTextColor": 0x888888
    }
}

function computeColorConfig(weatherObj) {
    const tempColor = getTemperatureColor(weatherObj.temp);
    const weatherColors = adaptColorToWeather(tempColor, weatherObj["ui_params"]["type"]);
    const timeColors = adaptColorToDaytime(weatherColors, weatherObj.sunrise, weatherObj.sunset);
    timeColors.dateTextColor = numberToHexString(timeColors.dateTextColor);
    timeColors.detailsTextColor = numberToHexString(timeColors.detailsTextColor);
    return timeColors;

}

let cards;
let funcDayTimeUpdates;
let dayWeather;

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
    $(".canvas").css("color", `${colorMap.detailsTextColor}`);
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
        $(".canvas").addClass("night");
    } else {
        $(".canvas").removeClass("night");
    }
    return colorMap.brightnessLevel;
}

function updateUpdateCurWeather(currentWeather) {
    $(".datetime-container .cur-temp").html(Math.round(currentWeather.temp));
    $(".datetime-container .cur-wind").html(Math.round(currentWeather.wind_speed*3.6));
}


function onGetLocation(position) {
    const weather_url = `https://transport-api.herokuapp.com/v1/weather/forecast/daily?lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
    $.getJSON(weather_url).done(function (weather) {

        cards.forEach((card, i) => {
            dayWeather = weather.daily[i];
            card.updateTempText(dayWeather.temp);
            if (i === 0) {
                updateUpdateCurWeather(weather.current);
                var brightness = adaptToDaytime(cards, dayWeather);
                clearInterval(funcDayTimeUpdates);
                if (brightness < 0.01 || brightness > 0.99) {
                    funcDayTimeUpdates = setInterval(adaptToDaytime, 60 * 1000, cards, dayWeather);
                } else {
                    // every 10 sec update if sunset/sunrise
                    funcDayTimeUpdates = setInterval(adaptToDaytime, 10 * 1000, cards, dayWeather);
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


// 📝 Fetch all DOM nodes in jQuery and Snap SVG
$(function () {
    gsap.registerPlugin(PixiPlugin);

    cards = $('.container').toArray().map(c => new WeatherCard(c));

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
    setInterval(getLocation, 60 * 60 * 1000); // 1 hour

});
