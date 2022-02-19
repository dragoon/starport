const nightColorConfig = {
    "cloud": 0x434a63,
    "textColor": 0xdddddd
};


/**
 *
 * @param currentTemperature in Celsius
 * @return Number: color as int
 * Currently NOT USED
 */
function getTemperatureColor(currentTemperature) {
    if (currentTemperature >= 25) {
        return hot_color;
    } else if (currentTemperature >= 20) { // 20 - 25
        return interpolateColor(normal_color, hot_color, (currentTemperature - 20) / 5);
    }

    return normal_color;
}


/**
 *
 * @param weatherType: string
 * @return {{
 * textColor: number,
 * cloud: number
 * }}
 */
function adaptCloudColorsToWeather(weatherType) {

    let cloudColor = 0xefefef;

    switch (weatherType) {
        case "snow":
        case "hail":
            cloudColor = 0xfcfcff;
            break;
    }

    return {
        "cloud": cloudColor,
        "textColor": 0x888888
    }
}

/**
 * Makes color darker according to the time between sunset and sunrise.

 * @param colorConfig {{
 * brightnessLevel: number,
 * cloud: number,
 * textColor: number,
 * night: boolean
 * }}
 * @param brightness {{number}} between 0 and 1
 * @return {{y: number, cloud1: number}}
 */
function adaptColorToDaytime(colorConfig, brightness) {
    if (brightness === 0) {
        // copy of night
        return {...nightColorConfig};
    } else if (brightness === 1) {
        return colorConfig;
    } else {
        // cloud colors have several stops during twilight
        if (brightness < 0.25) {
            colorConfig.cloud = interpolateColor(0xa62929, nightColorConfig.cloud, 1-brightness*4);
            // colorConfig.cloud2 = interpolateColor(0xc78585, nightColorConfig.cloud2, 1-brightness*4);
            // colorConfig.cloud3 = interpolateColor(0x8a5b5b, nightColorConfig.cloud3, 1-brightness*4);
        } else {
            colorConfig.cloud = interpolateColor(colorConfig.cloud, 0xa62929, (1-brightness)*4/3);
            // colorConfig.cloud2 = interpolateColor(colorConfig.cloud2, 0xc78585, (1-brightness)*4/3);
            // colorConfig.cloud3 = interpolateColor(colorConfig.cloud3, 0x8a5b5b, (1-brightness)*4/3);
        }
        colorConfig.textColor = interpolateColor(colorConfig.textColor, nightColorConfig.textColor, 1-brightness);
        return colorConfig;
    }
}
