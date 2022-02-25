/**
 * A linear interpolator for hex colors.
 *
 * Based on:
 * https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
 *
 * @param {Number} a  (hex color start val)
 * @param {Number} b  (hex color end val)
 * @param {Number} amount  (the amount to fade from a to b)
 *
 * @example
 * // returns 0x7f7f7f
 * lerpColor(0x000000, 0xffffff, 0.5)
 *
 * @returns {Number}
 */
const interpolateColor = function (a, b, amount) {
    const ar = a >> 16,
        ag = a >> 8 & 0xff,
        ab = a & 0xff,

        br = b >> 16,
        bg = b >> 8 & 0xff,
        bb = b & 0xff,

        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return (rr << 16) + (rg << 8) + (rb | 0);
};

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param {Number} colorInt  Hex value of a color, 0xffffff
 * @return {{s: number, h: number, l: number}} The HSL representation
 */
function hexToHsl(colorInt) {
    let r = colorInt >> 16,
        g = colorInt >> 8 & 0xff,
        b = colorInt & 0xff;

    r /= 255, g /= 255, b /= 255;

    let v=Math.max(r,g,b), c=v-Math.min(r,g,b), f=(1-Math.abs(v+v-c-1));
    let h= c && ((v===r) ? (g-b)/c : ((v===g) ? 2+(b-r)/c : 4+(r-g)/c));

    return {h: (h<0?h+6:h)*60, s: f ? c/f : 0, l: (v+v-c)/2};
}

function rgbToHex(r, g, b) {
    return (r << 16) + (g << 8) + b | 0;
}


/**
 * Converts an HSL color value to Hex. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param h  {Number}     hue
 * @param s  {Number}     saturation
 * @param l  {Number}     lightness
 * @return   {Number}     Hex representation
 */
function hslToHex(h, s, l) {
    let a= s*Math.min(l,1-l);
    let f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);
    return rgbToHex(f(0)*255, f(8)*255, f(4)*255);
}

/**
 *
 * @param {Number} color
 * @param {Number} opacity
 * @return {string}
 */
function numberToHexString(color, opacity=1) {
    if (opacity === 1) {
        return "#" + color.toString(16).padStart(6, '0');
    }
    return "#" + color.toString(16).padStart(6, '0') + Math.round(Number(255*opacity)).toString(16).padStart(2, '0');
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}


/**
 * @return {number|*}
 */
function getRandomNormal(min, max, skew=1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random() //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random()
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)

    num = num / 10.0 + 0.5 // Translate to 0 -> 1
    if (num > 1 || num < 0)
        num = getRandomNormal(min, max, skew) // resample between 0 and 1 if out of range

    else {
        num = Math.pow(num, skew) // Skew
        num *= max - min // Stretch to fill range
        num += min // offset to min
    }
    return num
}