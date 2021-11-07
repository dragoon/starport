var myWidth = 0, myHeight = 0;

function updateSunrise(brightness) {
    updateDimensions();
    let x = myWidth*0.75;
    let y = myHeight*(1 - brightness);


    document.getElementById("sun_r").style.background = '-webkit-radial-gradient(' + x + 'px ' + y + 'px, circle, rgba(242,248,247,1) 0%,rgba(249,249,28,1) 3%,rgba(247,214,46,1) 8%, rgba(248,200,95,1) 12%,rgba(201,165,132,1) 30%,rgba(115,130,133,1) 51%,rgba(46,97,122,1) 85%,rgba(24,75,106,1) 100%)';
    document.getElementById("sun_r").style.background = '-moz-radial-gradient(' + x + 'px ' + y + 'px, circle, rgba(242,248,247,1) 0%,rgba(249,249,28,1) 3%,rgba(247,214,46,1) 8%, rgba(248,200,95,1) 12%,rgba(201,165,132,1) 30%,rgba(115,130,133,1) 51%,rgba(46,97,122,1) 85%,rgba(24,75,106,1) 100%)';
    document.getElementById("sun_r").style.background = '-ms-radial-gradient(' + x + 'px ' + y + 'px, circle, rgba(242,248,247,1) 0%,rgba(249,249,28,1) 3%,rgba(247,214,46,1) 8%, rgba(248,200,95,1) 12%,rgba(201,165,132,1) 30%,rgba(115,130,133,1) 51%,rgba(46,97,122,1) 85%,rgba(24,75,106,1) 100%)';

    document.getElementById("sunDay").style.background = '-webkit-radial-gradient(' + x + 'px ' + y + 'px, circle, rgba(252,255,251,0.9) 0%,rgba(253,250,219,0.4) 30%,rgba(226,219,197,0.01) 70%, rgba(226,219,197,0.0) 70%,rgba(201,165,132,0) 100%)';
    document.getElementById("sunDay").style.background = '-moz-radial-gradient(' + x + 'px ' + y + 'px, circle, rgba(252,255,251,0.9) 0%,rgba(253,250,219,0.4) 30%,rgba(226,219,197,0.01) 70%, rgba(226,219,197,0.0) 70%,rgba(201,165,132,0) 100%)';
    document.getElementById("sunDay").style.background = '-ms-radial-gradient(' + x + 'px ' + y + 'px, circle, rgba(252,255,251,0.9) 0%,rgba(253,250,219,0.4) 30%,rgba(226,219,197,0.01) 70%, rgba(226,219,197,0.0) 70%,rgba(201,165,132,0) 100%)';

    document.getElementById("sunSet").style.background = '-webkit-radial-gradient(' + x + 'px ' + y + 'px, circle, rgba(254,255,255,0.8) 5%,rgba(236,255,0,1) 10%,rgba(253,50,41,1) 25%, rgba(243,0,0,1) 40%,rgba(93,0,0,1) 100%)';
    document.getElementById("sunSet").style.background = '-moz-radial-gradient(' + x + 'px ' + y + 'px, circle, rgba(254,255,255,0.8) 5%,rgba(236,255,0,1) 10%,rgba(253,50,41,1) 25%, rgba(243,0,0,1) 40%,rgba(93,0,0,1) 100%)';
    document.getElementById("sunSet").style.background = '-ms-radial-gradient(' + x + 'px ' + y + 'px, circle, rgba(254,255,255,0.8) 5%,rgba(236,255,0,1) 10%,rgba(253,50,41,1) 25%, rgba(243,0,0,1) 40%,rgba(93,0,0,1) 100%)';

    let bodyWidth = document.getElementsByTagName("body")[0].clientWidth;

    document.getElementById("sun_r").style.width = (bodyWidth);
    document.getElementById("sun_r").style.left = "0px";
    document.getElementById("sunDay").style.width = (bodyWidth);
    document.getElementById("sunDay").style.left = "0px";

    document.getElementById("darknessOverlaySky").style.opacity = Math.min((y - (myHeight * 7 / 10)) / (myHeight - (myHeight * 7 / 10)), 1);
    document.getElementById("horizonNight").style.opacity = (y - (myHeight * 4 / 5)) / (myHeight - (myHeight * 4 / 5));

    document.getElementById("sunDay").style.opacity = (1 - y / myHeight);
    document.getElementById("sky").style.opacity = (1 - y / myHeight);
    document.getElementById("sunSet").style.opacity = (y / myHeight - 0.2);


    if (y >= 0) {
        if (y > myHeight / 2) {
            document.getElementById("sun_r").style.opacity = Math.min((myHeight - y) / (myHeight / 2) + 0.2, 0.5);
            document.getElementById("horizon").style.opacity = (myHeight - y) / (myHeight / 2) + 0.2;
        } else {
            document.getElementById("horizon").style.opacity = Math.min(y / (myHeight / 2), 0.99);
            document.getElementById("sun_r").style.opacity = Math.min(y / (myHeight / 2), 0.5);
        }

    }


}


function updateDimensions() {
    myWidth =  window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    myHeight = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;

}

function windowResize() {
    updateDimensions();
}