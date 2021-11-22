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
        this.container = document.getElementById(elem_id);
        this.card = document.querySelector(`#${elem_id} .card`);
        this.outerSVG = Snap(`#${elem_id} .outer`);
        this.innerSVG = Snap(`#${elem_id} .card .inner`);

        this.weatherContainers = [...Array(3).keys()].map(i => {
            let c = new PIXI.Container();
            // 0 is the closest cloud (-1 index), 2 is behind (-3)
            c.zIndex = -i;
            return c;
        });
        this.canvas = document.querySelectorAll(`#${elem_id} #canvas`);
        this.scene = new PIXI.Container();
        this.scene.sortableChildren = true;
        this.scene.interactiveChildren = false;
        this.weatherContainers.forEach(wc => this.scene.addChild(wc));

        this.innerLeafHolder = this.innerSVG.group();
        this.outerLeafHolder = this.outerSVG.group();

        // technical
        this.lightningTimeout = 0;
        this.start = undefined;
        this.rain_count = 0;
        this.leaf_count = 0;
        this.flake_count = 0;
        this.hail_count = 0;

        // create sizes object, we update this later

        this.sizes = {
            container: {width: 0, height: 0},
            card: {width: 0, height: 0}
        };

        // cloud containers
        this.clouds = [];
        this.fog = [];

        this.summary = document.querySelector(`#${elem_id} .card .details #summary`);
        this.date = document.querySelector(`#${elem_id} .card .details #date`);
        this.temp = document.querySelector(`#${elem_id} .card .details #temperature`);
        this.temp_min = document.querySelector(`#${elem_id} .card .details .temp .temperature-night`);
        this.tempFormat = document.querySelector(`#${elem_id} .card .details .temp-degrees`);
        this.leaf = Snap.select(`#${elem_id} .card #leaf`);
        this.sun = document.querySelector(`#${elem_id} .card #sun`);
    }

    resize() {
        // 📏 grab window and card sizes
        this.sizes.container.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        this.sizes.container.height = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;
        this.sizes.card.width = this.card.clientWidth;
        this.sizes.card.height = this.card.clientHeight;
        this.sizes.card.offset = { left: this.card.offsetLeft, top: this.card.offsetTop };

        // 📐 update svg sizes

        this.innerSVG.attr({
            width: this.sizes.card.width,
            height: this.sizes.card.height
        });


        this.outerSVG.attr({
            width: this.sizes.container.width,
            height: this.sizes.container.height
        });

        this.renderer = PIXI.autoDetectRenderer(
            {
                "width": this.sizes.card.width,
                "height": this.sizes.card.height,
                "view": this.canvas[0], transparent: true, antialias: true
            });
    }

    updateDateText(d) {
        // d is a Date
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        //this.date.html(days[d.getDay()] + " " + d.getDate() + " " + months[d.getMonth()]);
        this.date.innerHTML = days[d.getDay()];
        gsap.fromTo(this.date, {x: 30}, {duration: 1.5, opacity: 1, x: 0, ease: Power4.easeOut});
    }

    drawCloud(i) {
        /*
        ☁️ We want to create a shape thats loopable but that can also
        be animated in and out. So we use Snap SVG to draw a shape
        with 4 sections. The 2 ends and 2 arches the same width as
        the card. So the final shape is about 4 x the width of the
        card.
        */
        let offset = Math.random() * this.sizes.card.width;
        let space = this.settings.cloudSpace * i;
        let height = space + this.settings.cloudHeight;
        let arch = height + this.settings.cloudArch + Math.random() * this.settings.cloudArch;
        let width = this.sizes.card.width;

        let cloud = new PIXI.Graphics()
            .moveTo(-width, 0)
            .lineTo(width, 0)
            .beginFill(0xffffff, 1)
            .quadraticCurveTo(width * 2, height / 2, width, height)
            .quadraticCurveTo(width * 0.5, arch, 0, height)
            .quadraticCurveTo(width * -0.5, arch, -width, height)
            .quadraticCurveTo(-(width * 2), height / 2, -width, 0);
        cloud.alpha = 0.5;

        this.weatherContainers[i].addChild(cloud);
        gsap.to(cloud, {
            duration: 0,
            ease: "none",
            x: offset,
        });

        return cloud;
    }

    drawFog(i) {
        /*
        ☁️ We want to create a shape thats loopable but that can also
        be animated in and out. So we use Snap SVG to draw a shape
        with 4 sections. The 2 ends and 2 arches the same width as
        the card. So the final shape is about 4 x the width of the
        card.
        */
        let offset = Math.random() * this.sizes.card.width;
        let space = this.settings.cloudSpace * i;
        let height = space + this.settings.cloudHeight;
        let arch = height + this.settings.cloudArch + Math.random() * this.settings.cloudArch;
        let width = this.sizes.card.width;

        let fog = new PIXI.Graphics()
            .moveTo(-width, height)
            .lineTo(width, height)
            .beginFill(0xffffff, 1)
            .quadraticCurveTo(width * 2, height / 2, width, 0)
            .quadraticCurveTo(width * 0.5, -arch + height, 0, 0)
            .quadraticCurveTo(width * -0.5, -arch + height, -width, 0)
            .quadraticCurveTo(-(width * 2), height / 2, -width, height);
        fog.visible = false;
        fog.position.y = (this.sizes.card.height - this.settings.cloudHeight - this.settings.cloudSpace * i);
        this.weatherContainers[i].addChild(fog);
        gsap.to(fog, {
            duration: 0,
            ease: "none",
            x: offset,
        });
        return fog;
    }

    makeRain(line = null) {
        // 💧 This is where we draw one drop of rain

        // first we set the line width of the line, we use this
        // to dictate which svg group it'll be added to and
        // whether it'll generate a splash

        let lineWidth = Math.random() * 3;
        let windOffset = this.settings.windSpeed * 10;

        // ⛈ line length is made longer for stormy weather

        const severe = new Set(["thunder", "severe", "hail"]);

        let lineLength = severe.has(this.currentWeather.type) ? 35 : 14;
        let strokeColor = severe.has(this.currentWeather.type) ? 0x777777 : 0x86a3f9;

        // Start the drop at a random point at the top but leaving
        // a 20px margin

        let x = Math.random() * (this.sizes.card.width - 40) + 20;
        // TODO: large lines were in different layers/holders

        if (line == null) {
            // Draw the line
            line = new PIXI.Graphics();
        } else {
            line.clear();
        }
        line.lineStyle({width: lineWidth, color: strokeColor, alpha: 1, cap: "round"});
        // Define line position - this aligns the top left corner of our canvas
        line.position.x = x - windOffset;
        line.position.y = 0 - lineLength;

        // Define pivot to the center of the element (think transformOrigin)
        line.pivot.set(0, lineLength / 2);
        //line.rotation = 0.785398; // in radiants, TODO: depend on wind

        // Draw line
        line.moveTo(0, 0);
        line.lineTo(0, lineLength);
        

        // add line to the scene for rendering
        this.weatherContainers[2].addChild(line);
        this.rain_count += 1;

        // Start the falling animation, calls onRainEnd when the
        // animation finishes.
        gsap.to(line,
            {
                duration: 1.5,
                delay: Math.random(),
                y: this.sizes.card.height,
                x: x,
                ease: Power2.easeIn,
                onComplete: this.onRainEnd.bind(this),
                onCompleteParams: [line]
            });
    }

    onRainEnd(line) {
        this.rain_count -= 1;

        if (this.rain_count < this.settings.rainCount) {
            this.makeRain(line);
        } else {
            this.scene.removeChild(line);
            line.destroy();
            line = null;
        }
    }

    makeLeaf() {
        const scale = 0.5 + Math.random() * 0.5;
        let newLeaf;

        const areaY = this.sizes.card.height / 2;
        let y = areaY + Math.random() * areaY;
        let endY = y - (Math.random() * (areaY * 2) - areaY);
        const x = -100;
        let endX;
        const colors = ['#b7a851', '#76993E', '#4A5E23', '#6D632F'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        let xBezier;

        if (scale > 0.8) {
            newLeaf = this.leaf.clone().appendTo(this.outerLeafHolder).attr({fill: color});
            xBezier = x + (this.sizes.container.width - this.sizes.card.offset.left) / 2;
            endX = this.sizes.container.width - this.sizes.card.offset.left + 50;
        } else {
            newLeaf = this.leaf.clone().appendTo(this.innerLeafHolder).attr({fill: color});
            xBezier = this.sizes.card.width / 2;
            endX = this.sizes.card.width + 50;

        }

        var bezier = [{x: xBezier, y: Math.random() * endY + endY / 3}, {x: endX, y: endY}];
        this.leaf_count += 1;
        gsap.fromTo(newLeaf.node,
            {
                rotation: Math.random() * 180,
                x: x, y: y,
                scale: scale
            },
            {
                duration: 2,
                rotation: Math.random() * 360,
                motionPath: {"path": bezier},
                onComplete: this.onLeafEnd.bind(this),
                onCompleteParams: [newLeaf],
                ease: Power0.easeIn
            });
    }

    onLeafEnd(leaf) {
        leaf.remove();
        leaf = null;
        this.leaf_count -= 1;

        if (this.leaf_count < this.settings.leafCount) {
            this.makeLeaf();
        }
    }

    makeHail(stone = null) {
        const windOffset = this.settings.windSpeed * 10;
        const offset = 0.25 * this.currentWeather.intensity;
        const scale = offset + Math.random() * offset;

        let x;
        let y = -10;
        let endY;
        const size = 5 * scale;
        const fillColor = this.currentWeather.type === 'sleet' || this.currentWeather.type.indexOf('mix') > -1 ? 0x86a3f9 : 0xffffff;

        if (stone == null) {
            stone = new PIXI.Graphics()
            .beginFill(fillColor, 1)
            .drawCircle(0, 0, size);
        } else {
            stone.clear();
            stone.beginFill(0xffffff, 1)
                .drawCircle(x, y, r);
        }

        if (size > 4) {
            x = 20 + Math.random() * (this.sizes.card.width - 40) + windOffset;
            endY = this.sizes.container.height + 10;
            x = x + this.sizes.card.offset.left;
            this.weatherContainers[1].addChild(stone);

        } else {
            x = 20 + Math.random() * (this.sizes.card.width + windOffset - 20);
            endY = this.sizes.card.height + 10;
            this.weatherContainers[2].addChild(stone);

        }
        this.hail_count += 1;

        // Start the falling animation, calls onHailEnd when the
        // animation finishes.
        gsap.fromTo(stone,
            {x: x - windOffset, y: y},
            {
                duration: 1,
                delay: Math.random(),
                y: endY, x: x,
                ease: Power2.easeIn,
                onComplete: this.onHailEnd.bind(this),
                onCompleteParams: [stone]
            }
        );
    }

    onHailEnd(stone) {
        this.hail_count -= 1;
        
        if (this.hail_count < this.settings.hailCount) {
            this.makeHail(stone);
        } else {
            this.scene.removeChild(stone);
            gsap.killTweensOf(stone);
            stone.destroy();
            stone = null;
        }
    }

    createCloud() {
        const cloudMiddleHeight = getRandomInt(this.sizes.card.width/4, this.sizes.card.width/4 + 40);
        // needs to be more or less circle
        const cloudMiddleWidth = cloudMiddleHeight * getRandomArbitrary(0.8, 1.2);

        // needs to be a bit smaller
        const cloudLeftHeight = cloudMiddleHeight * getRandomArbitrary(0.4, 0.8);
        const cloudLeftWidth = cloudLeftHeight * getRandomArbitrary(0.8, 1.2);

        const cloudRightHeight = cloudMiddleHeight * getRandomArbitrary(0.4, 0.8);
        const cloudRightWidth = cloudRightHeight * getRandomArbitrary(0.8, 1.2);
        const topOffset = this.sizes.card.height * getRandomArbitrary(0, 0.1);
        const leftOffset = this.sizes.card.width * getRandomArbitrary(0.2, 0.6);
        const delay = getRandomInt(0, 2000);
    }

    makeSnow(flake = null) {
        let offset = 0.5 * this.currentWeather.intensity;
        let scale = offset + Math.random() * offset;

        let x = 20 + Math.random() * (this.sizes.card.width - 40);
        let y = -10;
        let r = 5 * (offset + Math.random() * offset);
        let endY;
        if (flake == null) {
            flake = new PIXI.Graphics()
                .beginFill(0xffffff, 1)
                .drawCircle(x, y, r);
        } else {
            flake.clear();
            flake.beginFill(0xffffff, 1)
                .drawCircle(x, y, r);
        }

        // TODO: big snow was in a different cloud holder
        if (scale > 0.8) {
            endY = this.sizes.container.height - this.sizes.card.offset.top + 10;
            this.weatherContainers[1].addChild(flake);
        } else {
            endY = this.sizes.card.height + 10;
            this.weatherContainers[2].addChild(flake);
        }

        this.flake_count += 1;

        gsap.fromTo(flake, {x: x, y: y}, {
            duration: getRandomNormal(5, 10),
            y: endY,
            onComplete: this.onSnowEnd.bind(this),
            onCompleteParams: [flake],
            ease: Power0.easeIn
        });
        gsap.to(flake, {duration: 3, x: x + (Math.random() * 150 - 75), repeat: -1, yoyo: true, ease: Power1.easeInOut});
    }

    onSnowEnd(flake) {
        this.flake_count -= 1;

        if (this.flake_count < this.settings.snowCount) {
            this.makeSnow(flake);
        } else {
            this.scene.removeChild(flake);
            gsap.killTweensOf(flake);
            flake.destroy();
            flake = null;
        }
    }

    setSunPosition() {
        switch (this.currentWeather.type) {
            case 'sun':
                this.sun.style.top = (this.sizes.card.height/2 - this.sun.clientHeight/2) + 'px';
                break;
            case 'cloud':
                let ypos =  this.sizes.card.height/2 - this.sun.clientHeight/2 - this.sizes.card.height * this.currentWeather.intensity / 4;
                this.sun.style.top = ypos + 'px';
                break;
            default:
                this.sun.style.top = -this.sun.clientHeight + 'px';
                break;
        }
    }

    changeWeather(weather) {
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

        this.container.classList.add(this.currentWeather.type);

        // windSpeed

        switch (this.currentWeather.type) {

            case 'severe':
            case 'wind':
            case 'smoke':
                gsap.to(this.settings, {duration: 3, windSpeed: 3 * this.currentWeather.intensity, ease: Power2.easeInOut});
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

        switch (this.currentWeather.type) {

            case 'mix':
            case 'mix-rain-snow':
            case 'mix-rain-sleet':
            case 'rain':
                gsap.to(this.settings, {duration: 3, rainCount: 40 * this.currentWeather.intensity, ease: Power2.easeInOut});
                break;
            case 'hail':
                gsap.to(this.settings, {duration: 3, rainCount: 10 * this.currentWeather.intensity, ease: Power2.easeInOut});
                break;
            case 'severe':
            case 'thunder':
                gsap.to(this.settings, {duration: 3, rainCount: 60 * this.currentWeather.intensity, ease: Power2.easeInOut});
                break;
            default:
                gsap.to(this.settings, {duration: 1, rainCount: 0, ease: Power2.easeOut});
                break;
        }


        // hailCount

        switch (this.currentWeather.type) {

            case 'mix':
                gsap.to(this.settings, {duration: 3, hailCount: 3 * this.currentWeather.intensity, ease: Power2.easeInOut});
                break;
            case 'mix-snow-sleet':
            case 'mix-rain-sleet':
                gsap.to(this.settings, {duration: 3, hailCount: 10 * this.currentWeather.intensity, ease: Power2.easeInOut});
                break;
            case 'sleet':
                gsap.to(this.settings, {duration: 3, hailCount: 20 * this.currentWeather.intensity, ease: Power2.easeInOut});
                break;
            case 'severe':
                gsap.to(this.settings, {duration: 3, hailCount: 3 * this.currentWeather.intensity, ease: Power2.easeInOut});
                break;
            case 'hail':
                gsap.to(this.settings, {duration: 3, hailCount: 20 * this.currentWeather.intensity, ease: Power2.easeInOut});
                break;
            default:
                gsap.to(this.settings, {duration: 1, hailCount: 0, ease: Power2.easeOut});
                break;
        }


        // leafCount

        switch (this.currentWeather.type) {

            case 'severe':
            case 'wind':
                gsap.to(this.settings, {duration: 3, leafCount: 5 * this.currentWeather.intensity, ease: Power2.easeInOut});
                break;
            default:
                gsap.to(this.settings, {duration: 1, leafCount: 0, ease: Power2.easeOut});
                break;
        }


        // snowCount

        switch (this.currentWeather.type) {

            case 'mix':
            case 'mix-rain-snow':
            case 'mix-snow-sleet':
            case 'snow':
                gsap.to(this.settings, {duration: 3, snowCount: 40 * this.currentWeather.intensity, ease: Power2.easeInOut});
                break;
            default:
                gsap.to(this.settings, {duration: 1, snowCount: 0, ease: Power2.easeOut});
                break;
        }


        // sun position
        this.setSunPosition();

        // animate fog
        if (this.currentWeather.type === 'haze' || this.currentWeather.type === 'smoke') {
            this.fog.forEach(f => {f.visible=true});
            this.fog.forEach((fog, i) => {
                gsap.killTweensOf(fog);
                gsap.to(fog, {
                    duration: 10 * (i + 1) / this.settings.windSpeed,
                    ease: "none",
                    x: `+=${this.sizes.card.width}`,
                    modifiers: {
                        x: gsap.utils.unitize(x => parseFloat(x) % this.sizes.card.width)
                    },
                    repeat: -1
                });
            })
        } else {
            this.fog.forEach(fog => {
                fog.visible=false;
                gsap.killTweensOf(fog);
            });
        }

        // lightning

        this.startLightningTimer();

        // remove clouds if sunny
        switch (weather.type) {

            case 'sun':
                this.clouds.forEach((cloud, i) => {
                    gsap.killTweensOf(cloud);
                    // animate clouds with gsap
                    if (cloud.offset > this.sizes.card.width * 2.5){
                        cloud.offset = -(this.sizes.card.width * 1.5);
                    }
                    gsap.to(cloud, {
                        duration: this.settings.windSpeed * (i+1),
                        ease: "none",
                        x: "+=800",
                        repeat: 0
                    });
                });
                break;
            default:
                // animate clouds
                this.clouds.forEach((cloud, i) => {
                    gsap.killTweensOf(cloud);
                    gsap.to(cloud, {
                        duration: 10 * (i + 1) / this.settings.windSpeed,
                        ease: "none",
                        x: `+=${this.sizes.card.width}`,
                        modifiers: {
                            x: gsap.utils.unitize(x => parseFloat(x) % this.sizes.card.width)
                        },
                        repeat: -1
                    });
                });
        }
    }

    updateSummaryText() {
        this.summary.innerHTML = this.currentWeather.name;
        gsap.fromTo(this.summary, {x: 30}, {duration: 1.5, opacity: 1, x: 0, ease: Power4.easeOut});
    }

    updateTempText(newTemp) {
        this.temp.innerHTML = Math.round(newTemp.day);
        this.temp_min.innerHTML = Math.round(newTemp.min);
        this.tempFormat.innerHTML = "°";
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

        var strike = this.innerLeafHolder.path('M' + points.join(' ')).attr({
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
        this.clouds = [...Array(3).keys()].map(i => this.drawCloud(i));
        // draw fog
        this.fog = [...Array(3).keys()].map(i => this.drawFog(i));

    }

    reset() {
        weather_types.forEach(t => this.container.classList.remove(t));
    }

    tick(timestamp) {
        if (this.start === undefined)
            this.start = timestamp;
        const elapsed = timestamp - this.start;

        if (elapsed > 100) {
            if (this.rain_count < this.settings.rainCount) this.makeRain();
            if (this.flake_count < this.settings.snowCount) this.makeSnow();
            if (this.leaf_count < this.settings.leafCount) this.makeLeaf();
            if (this.hail_count < this.settings.hailCount) this.makeHail();
            this.start = timestamp;
        }

        this.renderer.render(this.scene);
    }

}
