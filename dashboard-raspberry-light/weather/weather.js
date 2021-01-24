gsap.registerPlugin(PixiPlugin, MotionPathPlugin);
const weather_types = ["snow", "mix", "mix-rain-sleet", "mix-rain-snow", "mix-snow-sleet", "sleet", "wind", "rain", "hail", "thunder", "severe", "cloud", "sun", "haze", "smoke"];

const hot_color = 0xe6b3b3;
const cold_color = 0xccdffb;
const normal_color = 0xccccff;

const nightColorConfig = {
    "top": 0x000000, "bottom": 0x000046,
    "cloud1": 0x00002e, "cloud1Opacity": 1,
    "cloud2": 0x4f525c, "cloud2Opacity": 0.6,
    "cloud3": 0x3f3d4c, "cloud3Opacity": 0.6,
    "detailsTextColor": 0xdddddd,
    "dateTextColor": 0xdddddd,
    "supportPlateOpacity": 0,
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
 * @return {{top: number, bottom: number}}
 */
function adaptColorToDaytime(colorConfig, sunriseTimestamp, sunsetTimestamp) {
    // get now in seconds
    let now = (new Date()).getTime()/1000;
    const hourSeconds = 60 * 60;
    if (now < sunriseTimestamp - hourSeconds || now > sunsetTimestamp + hourSeconds) {
        // copy of night
        return {...nightColorConfig};
    } else if (now > sunriseTimestamp + hourSeconds && now < sunsetTimestamp - hourSeconds) {
        // day
        return colorConfig;
    } else {
        // TWILIGHT!
        console.log("TWILIGHT");
        const hslColor = hexToHsl(colorConfig.bottom);
        // compute percentage to make darker
        const darknessLevel = Math.min(
            Math.abs( now + hourSeconds - sunriseTimestamp),
            Math.abs(now - hourSeconds - sunsetTimestamp)) / (2*hourSeconds);

        // first color bottom gradient
        colorConfig.bottom = hslToHex(hslColor.h, hslColor.s, hslColor.l * darknessLevel);
        // top gradient -- darker
        colorConfig.top = hslToHex(hslColor.h, hslColor.s, hslColor.l * (darknessLevel - darknessLevel/2));

        // if sunset -- set clouds to night colors
        if (now > sunsetTimestamp - hourSeconds) {
            colorConfig.cloud1 = nightColorConfig.cloud1;
            colorConfig.cloud2 = nightColorConfig.cloud2;
            colorConfig.cloud3 = nightColorConfig.cloud3;
            colorConfig.cloud2Opacity = nightColorConfig.cloud2Opacity;
            colorConfig.cloud3Opacity = nightColorConfig.cloud3Opacity;
            colorConfig.detailsTextColor = nightColorConfig.detailsTextColor;
        }
        // if sunrise -- set to day colors
        else {
            colorConfig.cloud2Opacity = 1;
            colorConfig.cloud3Opacity = 1;
        }
        colorConfig.dateTextColor = interpolateColor(colorConfig.textColor, nightColorConfig.textColor, 1-darknessLevel);
        if (now <= sunriseTimestamp || now >= sunsetTimestamp) {
            colorConfig.night = true;
        }
        if (darknessLevel <= 0.5) {
            colorConfig.supportPlateOpacity = darknessLevel;
        } else {
            colorConfig.supportPlateOpacity = (1 - darknessLevel);
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
 * top: Number, bottom: Number,
 * cloud2: number,
 * cloud1: number,
 * cloud3: number}}
 */
function adaptColorToWeather(tempColor, weatherType) {

    switch (weatherType) {
        case "rain":
            tempColor = 0xcdcdcd;
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
        "top": hslToHex(hslColor.h, hslColor.s, Math.min(1, hslColor.l * 1.05)),
        "bottom":  hslToHex(hslColor.h, hslColor.s, hslColor.l / 1.1),
        "cloud1": 0xefefef, "cloud1Opacity": 1,
        "cloud2": 0xE6E6E6, "cloud2Opacity": 1,
        "cloud3": 0xD5D5D5, "cloud3Opacity": 1,
        "dateTextColor": 0x888888,
        "detailsTextColor": 0x888888,
        "supportPlateOpacity": 0,
    }
}

function computeColorConfig(weatherObj) {
    const tempColor = getTemperatureColor(weatherObj.temp);
    const weatherColors = adaptColorToWeather(tempColor, weatherObj["ui_params"]["type"]);
    const timeColors = adaptColorToDaytime(weatherColors, weatherObj.sunrise, weatherObj.sunset);
    timeColors.top = numberToHexString(timeColors.top);
    timeColors.bottom = numberToHexString(timeColors.bottom);
    timeColors.dateTextColor = numberToHexString(timeColors.dateTextColor);
    timeColors.detailsTextColor = numberToHexString(timeColors.detailsTextColor);
    timeColors.supportPlateColor = numberToHexString(0x000000, timeColors.supportPlateOpacity);
    return timeColors;

}

let cards;
let funcDayTimeUpdates;

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


function adaptToDaytime(card, day_weather) {
    const colorMap = computeColorConfig(day_weather);
    $(".canvas").css("color", `${colorMap.detailsTextColor}`);
    $(".datetime-container").css({
        "color": `${colorMap.dateTextColor}`,
        "background": `${colorMap.supportPlateColor}`
    });
    $(".sky").css("background", `linear-gradient(to top, ${colorMap.bottom} 0%, ${colorMap.top} 100%)`);
    card.clouds[0].tint = colorMap.cloud1;
    card.clouds[1].tint = colorMap.cloud2;
    card.clouds[2].tint = colorMap.cloud3;
    if (colorMap["night"] === true) {
        $(".canvas").addClass("night");
    } else {
        $(".canvas").removeClass("night");
    }
}


function onGetLocation(position) {
    const weather_url = `https://transport-api.herokuapp.com/v1/weather/forecast/daily?lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
    $.getJSON(weather_url).done(function (weather) {

        cards.forEach((card, i) => {
            let day_weather;
            if (i === 0) {
                day_weather = weather.current;
                card.updateTempText({"day": day_weather.temp, "min": weather.daily[i].temp.min});
                adaptToDaytime(card, day_weather);
                clearInterval(funcDayTimeUpdates);
                funcDayTimeUpdates = setInterval(adaptToDaytime, 60*1000, day_weather);
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
