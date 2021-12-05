const nightColorConfig = {
    "cloud1": 0x00002e, "cloud1Opacity": 1,
    "cloud2": 0x434a63, "cloud2Opacity": 0.6,
    "cloud3": 0x3f3d4c, "cloud3Opacity": 0.6,
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
 * @param tempColor: number
 * @param weatherType: string
 * @return {{cloud2Opacity: number,
 * cloud3Opacity: number,
 * cloud1Opacity: number,
 * cloud2: number,
 * cloud1: number,
 * cloud3: number}}
 */
function adaptCloudColorsToWeather(weatherType) {

    let cloud1Color = 0xefefef;
    let cloud2Color = 0xEaEaEa;
    let cloud3Color = 0xD1D1D1;
    let cloud1Opacity = 1;
    let cloud2Opacity = 0.7;
    let cloud3Opacity = 0.7;

    switch (weatherType) {
        case "snow":
        case "hail":
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

/**
 * Makes color darker according to the time between sunset and sunrise.

 * @param colorConfig {{
 * brightnessLevel: number,
 * cloud1: number,
 * cloud2: number,
 * cloud3: number,
 * textColor: number,
 * night: boolean,
 * cloud1Opacity: number,
 * cloud2Opacity: number,
 * cloud3Opacity: number
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
            colorConfig.cloud1 = interpolateColor(0xa62929, nightColorConfig.cloud1, 1-brightness*4);
            colorConfig.cloud2 = interpolateColor(0xc78585, nightColorConfig.cloud2, 1-brightness*4);
            colorConfig.cloud3 = interpolateColor(0x8a5b5b, nightColorConfig.cloud3, 1-brightness*4);
        } else {
            colorConfig.cloud1 = interpolateColor(colorConfig.cloud1, 0xa62929, (1-brightness)*4/3);
            colorConfig.cloud2 = interpolateColor(colorConfig.cloud2, 0xc78585, (1-brightness)*4/3);
            colorConfig.cloud3 = interpolateColor(colorConfig.cloud3, 0x8a5b5b, (1-brightness)*4/3);
        }
        colorConfig.textColor = interpolateColor(colorConfig.textColor, nightColorConfig.textColor, 1-brightness);
        colorConfig.cloud2Opacity = nightColorConfig.cloud2Opacity + (1-nightColorConfig.cloud2Opacity)*brightness;
        colorConfig.cloud3Opacity = nightColorConfig.cloud3Opacity + (1-nightColorConfig.cloud3Opacity)*brightness;
        return colorConfig;
    }
}
