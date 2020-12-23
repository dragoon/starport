class WeatherCard {
    constructor(container) {

        // in an object so the values can be animated in gsap
        this.settings = {
            windSpeed: 2,
            rainCount: 0,
            hailCount: 0,
            leafCount: 0,
            snowCount: 0,
            fogCount: 0,
            cloudHeight: 100,
            cloudSpace: 30,
            cloudArch: 50,
            renewCheck: 10,
            splashBounce: 80
        };

        let elem_id = container.id;
        this.container = $(container);
        this.card = $(`#${elem_id} .card`);
        this.outerSVG = Snap(`#${elem_id} .outer`);
        this.innerSVG = Snap(`#${elem_id} .card .inner`);
        this.backSVG = Snap(`#${elem_id} .back`);
        this.weatherContainer1 = Snap.select(`#${elem_id} .card #layer1`);
        this.weatherContainer2 = Snap.select(`#${elem_id} .card #layer2`);
        this.weatherContainer3 = Snap.select(`#${elem_id} .card #layer3`);

        this.innerRainHolder1 = this.weatherContainer1.group();
        this.innerRainHolder2 = this.weatherContainer2.group();
        this.innerRainHolder3 = this.weatherContainer3.group();
        this.innerLeafHolder = this.weatherContainer1.group();
        this.innerSnowHolder = this.weatherContainer1.group();
        this.innerHailHolder = this.weatherContainer2.group();
        this.innerLightningHolder = this.weatherContainer1.group();
        this.outerSplashHolder = this.outerSVG.group();
        this.outerLeafHolder = this.outerSVG.group();
        this.outerSnowHolder = this.outerSVG.group();
        this.outerHailHolder = this.weatherContainer3.group();
        // Set mask for leaf holder
        this.leafMask = this.outerSVG.rect();
        this.outerLeafHolder.attr({'clip-path': this.leafMask});

        // technical
        this.cloudsChanged = false;
        this.lightningTimeout = 0;
        this.tickCount = 0;
        this.rain = [];
        this.leafs = [];
        this.snow = [];
        this.hail = [];

        // create sizes object, we update this later

        this.sizes = {
            container: {width: 0, height: 0},
            card: {width: 0, height: 0}
        };

        // grab cloud groups

        this.clouds = [
            {group: Snap.select(`#${elem_id} .card #cloud1`)},
            {group: Snap.select(`#${elem_id} .card #cloud2`)},
            {group: Snap.select(`#${elem_id} .card #cloud3`)}];


        this.fog = [
            {group: Snap.select(`#${elem_id} .card #fog1`)},
            {group: Snap.select(`#${elem_id} .card #fog2`)},
            {group: Snap.select(`#${elem_id} .card #fog3`)}];

        this.summary = $(`#${elem_id} .card .details #summary`);
        this.date = $(`#${elem_id} .card .details #date`);
        this.temp = $(`#${elem_id} .card .details #temperature`);
        this.temp_min = $(`#${elem_id} .card .details .temp .temperature-night`);
        this.tempFormat = $(`#${elem_id} .card .details .temp-degrees`);
        this.leaf = Snap.select(`#${elem_id} .card #leaf`);
        this.sun = $(`#${elem_id} .card #sun`);
    }

    resize() {
        // 📏 grab window and card sizes
        this.sizes.container.width = this.container.width();
        this.sizes.container.height = this.container.height();
        this.sizes.card.width = this.card.width();
        this.sizes.card.height = this.card.height();
        this.sizes.card.offset = this.card.offset();

        // 📐 update svg sizes

        this.innerSVG.attr({
            width: this.sizes.card.width,
            height: this.sizes.card.height
        });


        this.outerSVG.attr({
            width: this.sizes.container.width,
            height: this.sizes.container.height
        });


        this.backSVG.attr({
            width: this.sizes.card.width + 80,
            height: this.sizes.card.height + 40
        });

        // 🍃 The leaf mask is for the leafs that float out of the
        // container, it is full window height and starts on the left
        // inline with the card
        this.leafMask.attr({
                x: this.sizes.card.offset.left,
                y: 0,
                width: this.sizes.container.width,
                height: this.sizes.container.height
            }
        );

    }

    updateDateText(d) {
        // d is a Date
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        //this.date.html(days[d.getDay()] + " " + d.getDate() + " " + months[d.getMonth()]);
        this.date.html(days[d.getDay()]);
        gsap.fromTo(this.date, {x: 30}, {duration: 1.5, opacity: 1, x: 0, ease: Power4.easeOut});
    }

    drawCloud(cloud, i) {
        /*

        ☁️ We want to create a shape thats loopable but that can also
        be animated in and out. So we use Snap SVG to draw a shape
        with 4 sections. The 2 ends and 2 arches the same width as
        the card. So the final shape is about 4 x the width of the
        card.

        */
        let space = this.settings.cloudSpace * i;
        let height = space + this.settings.cloudHeight;
        let arch = height + this.settings.cloudArch + Math.random() * this.settings.cloudArch;
        let width = this.sizes.card.width;

        let points = [];
        points.push('M' + [-width, 0].join(','));
        points.push([width, 0].join(','));
        points.push('Q' + [width * 2, height / 2].join(','));
        points.push([width, height].join(','));
        points.push('Q' + [width * 0.5, arch].join(','));
        points.push([0, height].join(','));
        points.push('Q' + [width * -0.5, arch].join(','));
        points.push([-width, height].join(','));
        points.push('Q' + [-(width * 2), height / 2].join(','));
        points.push([-width, 0].join(','));

        var path = points.join(' ');
        if (!cloud.path) cloud.path = cloud.group.path();
        cloud.path.animate({
                d: path
            },
            0);
        cloud.group.transform('t' + cloud.offset + ',' + 0)
    }

    drawFog(cloud, i) {
        /*
            ☁️ We want to create a shape thats loopable but that can also
            be animated in and out. So we use Snap SVG to draw a shape
            with 4 sections. The 2 ends and 2 arches the same width as
            the card. So the final shape is about 4 x the width of the
            card.

            */
        let space = this.settings.cloudSpace * i;
        let height = space + this.settings.cloudHeight;
        let arch = height + this.settings.cloudArch + Math.random() * this.settings.cloudArch;
        let width = this.sizes.card.width;
        let bottom = this.sizes.card.height;
        let top = this.sizes.card.height - height;
        let half = this.sizes.card.height - height / 2;
        let points = [];
        points.push('M' + [-width, height].join(','));
        points.push([width, height].join(','));
        points.push('Q' + [width * 2, height / 2].join(','));
        points.push([width, 0].join(','));
        points.push('Q' + [width * 0.5, -arch + height].join(','));
        points.push([0, 0].join(','));
        points.push('Q' + [width * -0.5, -arch + height].join(','));
        points.push([-width, 0].join(','));
        points.push('Q' + [-(width * 2), height / 2].join(','));
        points.push([-width, height].join(','));

        let path = points.join(' ');
        if (!cloud.path) cloud.path = cloud.group.path();
        cloud.path.animate({
                d: path
            },
            0);
    }

    makeRain() {
        // 💧 This is where we draw one drop of rain

        // first we set the line width of the line, we use this
        // to dictate which svg group it'll be added to and
        // whether it'll generate a splash

        var lineWidth = Math.random() * 3;

        // ⛈ line length is made longer for stormy weather

        var lineLength = this.currentWeather.type == 'thunder' || this.currentWeather.type == 'severe' || this.currentWeather.type == 'hail' ? 35 : 14;

        // Start the drop at a random point at the top but leaving
        // a 20px margin

        var x = Math.random() * (this.sizes.card.width - 40) + 20;

        // Draw the line

        var line = this['innerRainHolder' + (3 - Math.floor(lineWidth))].path('M0,0 0,' + lineLength).attr({
            fill: 'none',
            stroke: this.currentWeather.type == 'thunder' || this.currentWeather.type == 'severe' || this.currentWeather.type == 'hail' ? '#777' : '#86a3f9',
            strokeWidth: lineWidth
        });


        // add the line to an array to we can keep track of how
        // many there are.

        this.rain.push(line);

        // Start the falling animation, calls onRainEnd when the
        // animation finishes.
        var windOffset = this.settings.windSpeed * 10;
        gsap.fromTo(line.node,
            {
                x: x - windOffset,
                y: 0 - lineLength
            },
            {
                duration: 1,
                delay: Math.random(),
                y: this.sizes.card.height,
                x: x,
                ease: Power2.easeIn,
                onComplete: this.onRainEnd.bind(this),
                onCompleteParams: [line, lineWidth, x, this.currentWeather.type]
            });
    }

    onRainEnd(line, width, x, type) {
        // first lets get rid of the drop of rain 💧

        line.remove();
        line = null;

        // We also remove it from the array

        for (var i in this.rain) {
            if (!this.rain[i].paper) this.rain.splice(i, 1);
        }

        // If there is less rain than the rainCount we should
        // make more.

        if (this.rain.length < this.settings.rainCount) {
            this.makeRain();

            // 💦 If the line width was more than 2 we also create a
            // splash. This way it looks like the closer (bigger)
            // drops hit the the edge of the card

            if (width > 2) this.makeSplash(x, type);
        }
    }

    makeSplash(x, type) {
        // 💦 The splash is a single line added to the outer svg.

        // The splashLength is how long the animated line will be
        var splashLength = type == 'thunder' || type == 'severe' || type == 'hail' ? 30 : 20;

        // splashBounce is the max height the line will curve up
        // before falling
        var splashBounce = type == 'thunder' || type == 'severe' || type == 'hail' ? 120 : 100;

        // this sets how far down the line can fall
        var splashDistance = 80;

        // because the storm rain is longer we want the animation
        // to last slighly longer so the overall speed is roughly
        // the same for both
        var speed = type == 'thunder' || type == 'severe' || type == 'hail' ? 0.7 : 0.5;

        // Set a random splash up amount based on the max splash bounce
        var splashUp = 0 - Math.random() * splashBounce;

        // Sets the end x position, and in turn defines the splash direction
        var randomX = Math.random() * splashDistance - splashDistance / 2;

        // Now we put the 3 line coordinates into an array.

        var points = [];
        points.push('M' + 0 + ',' + 0);
        points.push('Q' + randomX + ',' + splashUp);
        points.push(randomX * 2 + ',' + splashDistance);

        // Draw the line with Snap SVG

        var splash = this.outerSplashHolder.path(points.join(' ')).attr({
            fill: "none",
            stroke: type == 'thunder' || type == 'severe' || type == 'hail' ? '#777' : '#86a3f9',
            strokeWidth: 1
        });


        // We animate the dasharray to have the line travel along the path

        var pathLength = Snap.path.getTotalLength(splash);
        var yOffset = this.sizes.card.height;
        splash.node.style.strokeDasharray = splashLength + ' ' + pathLength;

        // Start the splash animation, calling onSplashComplete when finished
        gsap.fromTo(splash.node,
            {
                strokeWidth: 2,
                y: yOffset,
                x:  20 + x,
                opacity: 1,
                strokeDashoffset: splashLength
            },
            {
                duration: speed,
                strokeWidth: 0,
                strokeDashoffset: -pathLength,
                opacity: 1,
                onComplete: this.onSplashComplete.bind(this),
                onCompleteParams: [splash],
                ease: SlowMo.ease.config(0.4, 0.1, false)
            });
    }

    onSplashComplete(splash) {
        // 💦 The splash has finished animating, we need to get rid of it

        splash.remove();
        splash = null;
    }

    makeLeaf() {
        var scale = 0.5 + Math.random() * 0.5;
        var newLeaf;

        var areaY = this.sizes.card.height / 2;
        var y = areaY + Math.random() * areaY;
        var endY = y - (Math.random() * (areaY * 2) - areaY);
        var x;
        var endX;
        var colors = ['#76993E', '#4A5E23', '#6D632F'];
        var color = colors[Math.floor(Math.random() * colors.length)];
        var xBezier;

        if (scale > 0.8) {
            newLeaf = this.leaf.clone().appendTo(this.outerLeafHolder).attr({fill: color});

            y = y + this.sizes.card.offset.top / 2;
            endY = endY + this.sizes.card.offset.top / 2;

            x = this.sizes.card.offset.left - 100;
            xBezier = x + (this.sizes.container.width - this.sizes.card.offset.left) / 2;
            endX = this.sizes.container.width + 50;
        } else {
            newLeaf = this.leaf.clone().appendTo(this.innerLeafHolder).attr({
                fill: color
            });

            x = -100;
            xBezier = this.sizes.card.width / 2;
            endX = this.sizes.card.width + 50;

        }

        this.leafs.push(newLeaf);

        var bezier = [{x: x, y: y}, {x: xBezier, y: Math.random() * endY + endY / 3}, {x: endX, y: endY}];
        gsap.fromTo(newLeaf.node,
            {
                rotation: Math.random() * 180,
                x: x, y: y,
                scale: scale
            },
            {
                duration: 2,
                rotation: Math.random() * 360,
                motionPath: bezier,
                onComplete: this.onLeafEnd.bind(this),
                onCompleteParams: [newLeaf],
                ease: Power0.easeIn
            });
    }

    onLeafEnd(leaf) {
        leaf.remove();
        leaf = null;

        for (var i in this.leafs) {
            if (!this.leafs[i].paper) this.leafs.splice(i, 1);
        }

        if (this.leafs.length < this.settings.leafCount) {
            this.makeLeaf();
        }
    }

    makeHail() {
        var windOffset = this.settings.windSpeed * 10;
        var offset = 0.25 * this.currentWeather.intensity;
        var scale = offset + Math.random() * offset;
        var newHail;

        var x;
        var endX; // = x - ((Math.random() * (areaX * 2)) - areaX)
        var y = -10;
        var endY;
        var size = 5 * scale;
        if (size > 4) {
            x = 20 + Math.random() * (this.sizes.card.width - 40) + windOffset;
            newHail = this.outerHailHolder.circle(0, 0, size).attr({
                fill: this.currentWeather.type == 'sleet' || this.currentWeather.type.indexOf('mix') > -1 ? '#86a3f9' : '#FFF'
            });

            endY = this.sizes.container.height + 10;
            //y = sizes.card.offset.top + this.settings.cloudHeight;
            x = x + this.sizes.card.offset.left;
            //xBezier = x + (sizes.container.width - sizes.card.offset.left) / 2;
            //endX = sizes.container.width + 50;
        } else {
            x = 20 + Math.random() * (this.sizes.card.width + windOffset - 20);
            newHail = this.innerHailHolder.circle(0, 0, size).attr({
                fill: this.currentWeather.type == 'sleet' || this.currentWeather.type.indexOf('mix') > -1 ? '#86a3f9' : '#FFF'
            });

            endY = this.sizes.card.height + 10;
            //x = -100;
            //xBezier = sizes.card.width / 2;
            //endX = sizes.card.width + 50;

        }

        this.hail.push(newHail);

        // Start the falling animation, calls onHailEnd when the
        // animation finishes.
        gsap.fromTo(newHail.node,
            {x: x - windOffset, y: y},
            {
                duration: 1,
                delay: Math.random(),
                y: endY, x: x,
                ease: Power2.easeIn,
                onComplete: this.onHailEnd.bind(this),
                onCompleteParams: [newHail, size, x, this.currentWeather.type]
            }
        );
        //gsap.fromTo(newHail.node, 3 + (Math.random() * 5), {x: x, y: y}, {y: endY, onComplete: onHailEnd, onCompleteParams: [newHail, size, x, currentWeather.type], ease: Power2.easeIn})
    }

    onHailEnd(stone, size, x, type) {
        // first lets get rid of the hail stone 🌩️

        stone.remove();
        stone = null;

        // We also remove it from the array

        for (var i in this.hail) {
            if (!this.hail[i].paper) this.hail.splice(i, 1);
        }

        // If there is less rain than the rainCount we should
        // make more.

        if (this.hail.length < this.settings.hailCount) {
            this.makeHail();
        }
    }

    makeSnow() {
        var offset = 0.5 * this.currentWeather.intensity;
        var scale = offset + Math.random() * offset;
        var newSnow;

        var x = 20 + Math.random() * (this.sizes.card.width - 40);
        var endX; // = x - ((Math.random() * (areaX * 2)) - areaX)
        var y = -10;
        var endY;

        if (scale > 0.8) {
            newSnow = this.outerSnowHolder.circle(0, 0, 5).attr({
                fill: 'white'
            });

            endY = this.sizes.container.height + 10;
            y = this.sizes.card.offset.top + this.settings.cloudHeight;
            x = x + this.sizes.card.offset.left;
            //xBezier = x + (sizes.container.width - sizes.card.offset.left) / 2;
            //endX = sizes.container.width + 50;
        } else {
            newSnow = this.innerSnowHolder.circle(0, 0, 5).attr({
                fill: 'white'
            });

            endY = this.sizes.card.height + 10;
            //x = -100;
            //xBezier = sizes.card.width / 2;
            //endX = sizes.card.width + 50;

        }

        this.snow.push(newSnow);

        gsap.fromTo(newSnow.node, {x: x, y: y}, {
            duration: 3 + Math.random() * 5,
            y: endY,
            onComplete:this.onSnowEnd.bind(this),
            onCompleteParams: [newSnow],
            ease: Power0.easeIn
        });
        gsap.fromTo(newSnow.node, {scale: 0}, {duration: 1, scale: scale, ease: Power1.easeInOut});
        gsap.to(newSnow.node, {duration:3, x: x + (Math.random() * 150 - 75), repeat: -1, yoyo: true, ease: Power1.easeInOut});
    }

    onSnowEnd(flake) {
        flake.remove();
        flake = null;

        for (var i in this.snow) {
            if (!this.snow[i].paper) this.snow.splice(i, 1);
        }

        if (this.snow.length < this.settings.snowCount) {
            this.makeSnow();
        }
    }

    changeWeather(weather) {
        if (weather.data) weather = weather.data;
        this.reset();

        this.currentWeather = weather;
        gsap.killTweensOf(this.summary);
        gsap.to(this.summary, {duration: 1, opacity: 0, x: -30, onComplete: this.updateSummaryText.bind(this), ease: Power4.easeIn});

        this.container.addClass(weather.type);
        weather.classes.forEach(c => this.container.addClass(c));

        // windSpeed

        switch (weather.type) {

            case 'severe':
            case 'wind':
            case 'smoke':
                gsap.to(this.settings, {duration: 3, windSpeed: 3 * weather.intensity, ease: Power2.easeInOut});
                break;
            case 'sun':
                gsap.to(this.settings,{duration: 3, windSpeed: 20, ease: Power2.easeInOut});
                break;
            case 'haze':
            case 'cloud':
                gsap.to(this.settings, {duration: 3, windSpeed: 1, ease: Power2.easeInOut});
                break;
            default:
                gsap.to(this.settings, {duration: 3, windSpeed: 0.5, ease: Power2.easeOut});
                break;
        }


        // rainCount

        switch (weather.type) {

            case 'mix':
            case 'mix-rain-snow':
            case 'mix-rain-sleet':
            case 'rain':
                gsap.to(this.settings, {duration: 3, rainCount: 20 * weather.intensity, ease: Power2.easeInOut});
                break;
            case 'hail':
                gsap.to(this.settings, {duration: 3, rainCount: 5 * weather.intensity, ease: Power2.easeInOut});
                break;
            case 'severe':
            case 'thunder':
                gsap.to(this.settings, {duration: 3, rainCount: 30 * weather.intensity, ease: Power2.easeInOut});
                break;
            default:
                gsap.to(this.settings, {duration: 1, rainCount: 0, ease: Power2.easeOut});
                break;
        }


        // hailCount

        switch (weather.type) {

            case 'mix':
                gsap.to(this.settings, {duration: 3, hailCount: 3 * weather.intensity, ease: Power2.easeInOut});
                break;
            case 'mix-snow-sleet':
            case 'mix-rain-sleet':
                gsap.to(this.settings, {duration: 3, hailCount: 10 * weather.intensity, ease: Power2.easeInOut});
                break;
            case 'sleet':
                gsap.to(this.settings, {duration: 3, hailCount: 20 * weather.intensity, ease: Power2.easeInOut});
                break;
            case 'severe':
                gsap.to(this.settings, {duration: 3, hailCount: 3 * weather.intensity, ease: Power2.easeInOut});
                break;
            case 'hail':
                gsap.to(this.settings, {duration: 3, hailCount: 20 * weather.intensity, ease: Power2.easeInOut});
                break;
            default:
                gsap.to(this.settings, {duration: 1, hailCount: 0, ease: Power2.easeOut});
                break;
        }


        // leafCount

        switch (weather.type) {

            case 'severe':
            case 'wind':
                gsap.to(this.settings, {duration: 3, leafCount: 5 * weather.intensity, ease: Power2.easeInOut});
                break;
            default:
                gsap.to(this.settings, {duration: 1, leafCount: 0, ease: Power2.easeOut});
                break;
        }


        // snowCount

        switch (weather.type) {

            case 'mix':
            case 'mix-rain-snow':
            case 'mix-snow-sleet':
            case 'snow':
                gsap.to(this.settings, {duration: 3, snowCount: 40 * weather.intensity, ease: Power2.easeInOut});
                break;
            default:
                gsap.to(this.settings, {duration: 1, snowCount: 0, ease: Power2.easeOut});
                break;
        }


        // sun position

        switch (weather.type) {

            case 'sun':
                gsap.to(this.sun, {
                    duration: 4,
                    x: 0,
                    y: this.sizes.card.height / 2 + 100,
                    ease: Power2.easeInOut
                });
                break;
            case 'cloud':
                var ypos =  100 + this.sizes.card.height / 2 - this.sizes.card.height * (weather.intensity - 1) / 2;
                gsap.to(this.sun, {
                    duration: 4,
                    x: 0,
                    y: ypos, ease: Power2.easeInOut
                });
                break;
            default:
                gsap.to(this.sun, {
                    duration: 2,
                    x: 0,
                    y: -100, leafCount: 0,
                    ease: Power2.easeInOut
                });
                break;
        }

        // lightning

        this.startLightningTimer();

        switch (weather.type) {

            case 'sun':
                this.clouds.forEach((cloud, i) => {
                    // animate clouds with gsap
                    gsap.to(cloud.group.node, {
                        duration: this.settings.windSpeed * (i+1),
                        ease: "none",
                        x: "+=800",
                        repeat: 0
                    });
                });
                break;
        }
    }

    updateSummaryText() {
        this.summary.html(this.currentWeather.name);
        gsap.fromTo(this.summary, {x: 30}, {duration: 1.5, opacity: 1, x: 0, ease: Power4.easeOut});
    }

    updateTempText(newTemp) {
        this.temp.html(Math.round(newTemp.day));
        this.temp_min.html(Math.round(newTemp.min));
        this.tempFormat.html("°");
        gsap.fromTo(this.temp, {x: 30}, {duration: 1.5, opacity: 1, x: 0, ease: Power4.easeOut});
        gsap.fromTo(this.tempFormat, {x: 30}, {duration: 1.5, opacity: 1, x: 0, ease: Power4.easeOut});
    }

    startLightningTimer() {
        if (this.lightningTimeout) clearTimeout(this.lightningTimeout);
        if (['thunder', 'severe', 'hail'].includes(this.currentWeather.type)) {
            this.lightningTimeout = setTimeout(this.lightning.bind(this), Math.random() * 6000);
        }
    }

    lightning() {
        this.startLightningTimer();
        gsap.fromTo(this.card, {y: -30}, {duration: 0.75, y: 0, ease: Elastic.easeOut});

        var pathX = 30 + Math.random() * (this.sizes.card.width - 60);
        var yOffset = 20;
        var steps = 20;
        var points = [pathX + ',0'];
        for (var i = 0; i < steps; i++) {
            var x = pathX + (Math.random() * yOffset - yOffset / 2);
            var y = this.sizes.card.height / steps * (i + 1);
            points.push(x + ',' + y);
        }

        var strike = this.weatherContainer1.path('M' + points.join(' ')).attr({
            fill: 'none',
            stroke: 'white',
            strokeWidth: 2 + Math.random()
        });


        gsap.to(strike.node, {
            duration: 1,
            opacity: 0, ease: Power4.easeOut, onComplete: function () {
                strike.remove();
                strike = null;
            }
        });
    }

    init() {
        // ☁️ draw clouds
        this.clouds.forEach((cloud, i) => {
            cloud.offset = Math.random() * this.sizes.card.width;
            this.drawCloud(cloud, i);
        });
        // draw fog
        this.fog.forEach((fog, i) => {
            fog.offset = Math.random() * this.sizes.card.width;
            this.drawCloud(fog, i);
        });

    }

    reset() {
        weather_types.forEach(t => this.container.removeClass(t));
        classes.forEach(t => this.container.removeClass(t));
    }

    tick() {
        this.tickCount++;
        var check = this.tickCount % this.settings.renewCheck;
        if (check) {
            if (this.rain.length < this.settings.rainCount) this.makeRain();
            if (this.leafs.length < this.settings.leafCount) this.makeLeaf();
            if (this.snow.length < this.settings.snowCount) this.makeSnow();
            if (this.hail.length < this.settings.hailCount) this.makeHail();
        }

        if (this.currentWeather !== undefined) {
            this.clouds.forEach((cloud, i) => {
                if (this.currentWeather.type !== 'sun') {
                    cloud.offset += this.settings.windSpeed / (i + 1);
                    if (cloud.offset > this.sizes.card.width){
                        cloud.offset = cloud.offset - this.sizes.card.width;
                    }
                    cloud.group.transform('t' + cloud.offset + ',' + 0);
                }
            });

            this.fog.forEach((fog, i) => {
                if (this.currentWeather.type === 'haze' || this.currentWeather.type === 'smoke') {
                    fog.offset += this.settings.windSpeed / (i + 1);
                    if (fog.offset > this.sizes.card.width) {
                        fog.offset = fog.offset - this.sizes.card.width;
                    }
                    fog.group.transform('t' + fog.offset + ',' + (this.sizes.card.height - this.settings.cloudHeight - this.settings.cloudSpace * i));
                } else {
                    if (fog.offset > -(this.sizes.card.width * 1.5)) {
                        fog.offset += this.settings.windSpeed / (i + 1);
                    }
                    if (fog.offset > this.sizes.card.width * 2.5){
                        fog.offset = -(this.sizes.card.width * 1.5);
                    }
                    fog.group.transform('t' + fog.offset + ',' + (this.sizes.card.height - this.settings.cloudHeight - this.settings.cloudSpace * i));
                }
            });
        }
    }

}
