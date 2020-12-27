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
            splashBounce: 80,
            makeSplash: false
        };

        let elem_id = container.id;
        this.container = $(container);
        this.card = $(`#${elem_id} .card`);
        this.outerSVG = Snap(`#${elem_id} .outer`);
        this.innerSVG = Snap(`#${elem_id} .card .inner`);
        this.weatherContainer1 = Snap.select(`#${elem_id} .card #layer1`);
        this.weatherContainer2 = Snap.select(`#${elem_id} .card #layer2`);
        this.weatherContainer3 = Snap.select(`#${elem_id} .card #layer3`);
        this.canvas = $(`#${elem_id} #canvas`);
        this.scene = new PIXI.Container();

        this.innerLeafHolder = this.weatherContainer1.group();
        this.innerHailHolder = this.weatherContainer2.group();
        this.innerLightningHolder = this.weatherContainer1.group();
        this.outerLeafHolder = this.outerSVG.group();
        this.outerHailHolder = this.weatherContainer3.group();
        // Set mask for leaf holder
        this.leafMask = this.outerSVG.rect();
        this.outerLeafHolder.attr({'clip-path': this.leafMask});

        // technical
        this.lightningTimeout = 0;
        this.start = undefined;
        this.rain_count = 0;
        this.leafs = [];
        this.flake_count = 0;
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

        this.renderer = PIXI.autoDetectRenderer(
            this.sizes.card.width + 80, // add 80 px margin for snow outside the card
            this.sizes.card.height + 40,
            {"view": this.canvas.get(0), "transparent": true, antialias: true});
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
        cloud.group.transform('t' + cloud.offset + ',' + (this.sizes.card.height - this.settings.cloudHeight - this.settings.cloudSpace * i));
    }

    makeRain() {
        // 💧 This is where we draw one drop of rain

        // first we set the line width of the line, we use this
        // to dictate which svg group it'll be added to and
        // whether it'll generate a splash

        let lineWidth = Math.random() * 2;
        let windOffset = this.settings.windSpeed * 10;

        // ⛈ line length is made longer for stormy weather

        const severe = new Set(["thunder", "severe", "hail"]);

        let lineLength = severe.has(this.currentWeather.type) ? 35 : 14;
        let strokeColor = severe.has(this.currentWeather.type) ? 0x777777 : 0x86a3f9;

        // Start the drop at a random point at the top but leaving
        // a 20px margin

        let x = Math.random() * (this.sizes.card.width - 40) + 20;
        // TODO: large lines were in different layers/holders

        // Draw the line
        let line = new PIXI.Graphics();

        // Define line style (think stroke)
        // width, color, alpha
        line.lineStyle(lineWidth, strokeColor, 1);

        // Define line position - this aligns the top left corner of our canvas
        line.position.x = x - windOffset;
        line.position.y = 0 - lineLength;

        // Define pivot to the center of the element (think transformOrigin)
        line.pivot.set(0, lineLength/2);
        //line.rotation = 0.785398; // in radiants, TODO: depend on wind

        // Draw line
        line.moveTo(0,0);
        line.lineTo(0, lineLength);

        // add line to the scene for rendering
        this.scene.addChild(line);
        this.rain_count += 1;

        // Start the falling animation, calls onRainEnd when the
        // animation finishes.
        gsap.to(line,
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

        this.scene.removeChild(line);
        this.rain_count -= 1;
        
        // If there is less rain than the rainCount we should
        // make more.

        if (this.rain_count < this.settings.rainCount) {
            this.makeRain();
        }
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
        let offset = 0.5 * this.currentWeather.intensity;
        let scale = offset + Math.random() * offset;

        let x = 20 + Math.random() * (this.sizes.card.width - 40);
        let y = -10;
        let r = 5 * (offset + Math.random() * offset);
        let endY;

        // TODO: big snow was in a different cloud holder
        if (scale > 0.8) {
            endY = this.sizes.container.height + 10;
            y = this.sizes.card.offset.top + this.settings.cloudHeight;
            x = x + this.sizes.card.offset.left;
        } else {
            endY = this.sizes.card.height + 10;
        }

        let circle = new PIXI.Graphics();
        circle.beginFill(0xffffff, 1);
        circle.drawCircle(x, y, r);
        this.scene.addChild(circle);
        this.flake_count += 1;

        gsap.fromTo(circle, {x: x, y: y}, {
            duration: 3 + Math.random() * 5,
            y: endY,
            onComplete: this.onSnowEnd.bind(this),
            onCompleteParams: [circle],
            ease: Power0.easeIn
        });
        //gsap.fromTo(circle, {scale: 0}, {duration: 1, scale: scale, ease: Power1.easeInOut});
        gsap.to(circle, {duration: 3, x: x + (Math.random() * 150 - 75), repeat: -1, yoyo: true, ease: Power1.easeInOut});
    }

    onSnowEnd(flake) {
        this.scene.removeChild(flake);
        this.flake_count -= 1;

        if (this.flake_count < this.settings.snowCount) {
            this.makeSnow();
        }
    }

    changeWeather(weather) {
        if (weather.data) weather = weather.data;
        this.reset();

        this.currentWeather = weather;
        gsap.killTweensOf(this.summary);
        gsap.to(this.summary, {
            duration: 1,
            opacity: 0,
            x: -30,
            onComplete: this.updateSummaryText.bind(this),
            ease: Power4.easeIn
        });

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
                var ypos =  100 + this.sizes.card.height / 2 - this.sizes.card.height * Math.max(0, weather.intensity - 1) / 2;
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

        // remove clouds if sunny
        switch (weather.type) {

            case 'sun':
                this.clouds.forEach((cloud, i) => {
                    // animate clouds with gsap
                    if (cloud.offset > this.sizes.card.width * 2.5){
                        cloud.offset = -(this.sizes.card.width * 1.5);
                    }
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
            this.drawFog(fog, i);
        });

    }

    reset() {
        weather_types.forEach(t => this.container.removeClass(t));
        classes.forEach(t => this.container.removeClass(t));
    }

    tick(timestamp) {
        if (this.start === undefined)
            this.start = timestamp;
        const elapsed = timestamp - this.start;

        if (elapsed > 1000) {
            if (this.rain_count < this.settings.rainCount) this.makeRain(timestamp);
            if (this.flake_count < this.settings.snowCount) this.makeSnow(timestamp);
            if (this.hail.length < this.settings.hailCount) this.makeHail(timestamp);
        }

        this.renderer.render(this.scene);
    }

}
