gsap.registerPlugin(PixiPlugin, MotionPathPlugin);

// Season enums can be grouped as static members of a class
class Weather {
    // Create new instances of the same class as static attributes
    static RAIN = new Weather("rain")
    static SNOW = new Weather("snow")
    static SLEET = new Weather("sleet")
    static HAIL = new Weather("hail")
    static MIX = new Weather("mix-rain-snow")
    static SEVERE = new Weather("thunder")
    static CLOUD = new Weather("cloud")
    static FOG = new Weather("haze")
    static SMOKE = new Weather("smoke")
    static SUN = new Weather("sun")

    constructor(name) {
        this.name = name
    }
}

const weather_types = ["snow", "mix-rain-snow", "sleet", "rain", "hail", "thunder", "cloud", "sun", "haze", "smoke"];



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
    constructor() {
        this.cards = Array.from(document.querySelectorAll('.container')).map(c => new WeatherCard(c));
        this.start = window.performance.now();
        this.brightness = 1;
        this.currentWeather = null;
        this.weatherJson = null;
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

        if (!this.currentWeather) return;
        
        const elapsed = timestamp - this.start; // float in milliseconds
        if (this.brightness < 0.01 || this.brightness > 0.99) {
            if (elapsed > 60 * 1000) {
                this.start = timestamp;
                this.adaptToDaytime();
            }
        } else {
            if (elapsed > 20 * 1000) {
                this.start = timestamp;
                this.adaptToDaytime();
            }
        }
    }

    #computeBrightness() {
        // get current time in seconds
        let now = dateService.getDate().getTime() / 1000;
        console.debug(now);
        let brightness;
        const sunriseTimestamp = this.currentWeather.sunrise;
        const sunsetTimestamp = this.currentWeather.sunset;
        const twilightSeconds = 30 * 60;
        if (now < sunriseTimestamp - twilightSeconds || now > sunsetTimestamp + twilightSeconds) {
            brightness = 0;
        } else if (now > sunriseTimestamp + twilightSeconds && now < sunsetTimestamp - twilightSeconds) {
            // day
            brightness = 1.0;
        } else {
            // compute percentage to make darker
            brightness = Math.min(
                Math.abs(now + twilightSeconds - sunriseTimestamp),
                Math.abs(now - twilightSeconds - sunsetTimestamp)) / (2 * twilightSeconds);
            // 0 -- dark , 1 - bright
            console.log("Brightness Level:", brightness);
        }
        return brightness;
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

        this.weatherJson = weather_json;
        this.currentWeather = weather_json.current;

        this.brightness = this.#computeBrightness();
        WeatherManager.#updateCurWeather(this.currentWeather);
        this.adaptToDaytime();
        addExtras(weather_json.extras);
    }

    #computeColorConfig(weather_type) {
        const weatherColors = adaptCloudColorsToWeather(weather_type);
        const timeColors = adaptColorToDaytime(weatherColors, this.brightness);
        timeColors.textColor = numberToHexString(timeColors.textColor);
        return timeColors;
    }

    /**
     * Return brightness level to properly set update frequency
     * @return number
     */
    adaptToDaytime() {
        this.brightness = this.#computeBrightness();
        const currentColorMap = this.#computeColorConfig(this.currentWeather["ui_params"]["type"]);
        const canvases = Array.from(document.querySelectorAll(".canvas"));
        canvases.forEach((c) => {
            c.style.color = currentColorMap.textColor;
            c.style.textShadow = "1px 1px " + numberToHexString(interpolateColor(0x00002e, 0xffffff, this.brightness));
        });
        updateSunrise(this.brightness);
        this.cards.forEach(card => card.adaptToDayTime(this.#computeColorConfig(card.currentWeather["type"])));
    }

}

