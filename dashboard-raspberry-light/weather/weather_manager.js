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
    let cloud2Color = 0xEaEaEa;
    let cloud3Color = 0xD1D1D1;
    let cloud1Opacity = 1;
    let cloud2Opacity = 0.7;
    let cloud3Opacity = 0.7;

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
        "textColor": 0x888888
    }
}

function computeColorConfig(weatherObj) {
    const tempColor = getTemperatureColor(weatherObj.temp);
    const weatherColors = adaptColorToWeather(tempColor, weatherObj["ui_params"]["type"]);
    const timeColors = adaptColorToDaytime(weatherColors, weatherObj.sunrise, weatherObj.sunset);
    timeColors.textColor = numberToHexString(timeColors.textColor);
    return timeColors;

}

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



function onGetLocation(position) {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const weather_url = `https://transport-api.herokuapp.com/v1/weather/forecast/daily?lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
    fetch(weather_url, {
        headers: {
            'Authorization': `token ${token}`,
        }
    })
        .then(response => response.json())
        .then(function (weather) {
            manager.setWeather(weather);
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



function tick(timestamp) {
    manager.tick(timestamp);
    requestAnimationFrame(tick);
}


class WeatherManager {
    constructor(autoupdates = true) {
        this.cards = Array.from(document.querySelectorAll('.container')).map(c => new WeatherCard(c));
        this.start = window.performance.now();
        this.brightness = 1;
        this.autoupdates = autoupdates;
    }

    init() {
        this.cards.forEach(card => card.resize());
        this.cards.forEach(card => card.init());
    }

    resize() {
        this.cards.forEach(card => card.resize());
    }

    tick(timestamp) {
        this.cards.forEach(card => card.tick(timestamp));

        // autoupdates are disabled in the test page
        if (!this.autoupdates) return;
        
        const elapsed = timestamp - this.start; // float in milliseconds
        if (this.brightness < 0.01 || this.brightness > 0.99) {
            if (elapsed > 60 * 1000) {
                this.start = timestamp;
                this.brightness = this.adaptToDaytime(currentWeather);
            }
        } else {
            if (elapsed > 20 * 1000) {
                this.start = timestamp;
                this.brightness = this.adaptToDaytime(currentWeather);
            }
        }
    }

    static #updateCurWeather(currentWeather) {
        document.querySelector(".datetime-container .cur-temp").innerHTML = Math.round(currentWeather.temp);
        document.querySelector(".datetime-container .cur-wind").innerHTML = Math.round(currentWeather.wind_speed * 3.6);
    }

    setWeather(weather_json) {
        this.cards.forEach((card, i) => {
            let dayWeather = weather_json.daily[i];
            card.changeWeather(dayWeather);
        });

        currentWeather = weather_json.current;
        WeatherManager.#updateCurWeather(currentWeather);
        let brightness = this.adaptToDaytime(currentWeather);
        addExtras(weather_json.extras);
    }

    /**
     * Return brightness level to properly set update frequency
     * @return number
     */
    adaptToDaytime(day_weather) {
        const colorMap = computeColorConfig(day_weather);
        const canvases = Array.from(document.querySelectorAll(".canvas"));
        canvases.forEach((c) => {
            c.style.color = colorMap.textColor;
            c.style.textShadow = "1px 1px " + numberToHexString(interpolateColor(0x00002e, 0xffffff, colorMap.brightnessLevel));
        });
        updateSunrise(colorMap.brightnessLevel);
        this.cards.forEach(card => card.adaptToDayTime(colorMap));

        return colorMap.brightnessLevel;
    }

}

