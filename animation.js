function Animation (time, frames) {
	this.time = time;
	this.compiledFrames = [];

	this.active = false;
	this.timeUntilChange = time;

	this.backward = false;

	this.activeFrame = 0;

	this.flip = false;

	this.compileFrames = function (frames) {
		for (var f in frames) {
			this.compiledFrames.push(html5.image(frames[f]));
		}
	}

	this.play = function () {
		this.active = true;
	}

	this.pause = function () {
		this.active = false;
	}

	this.step = function () {
		if (this.active) {
			this.timeUntilChange -= gDeltaTime;

			if (this.timeUntilChange <= 0) {
				this.changeFrame();
				this.timeUntilChange = this.time;
			}
		}
	}

	this.changeFrame = function () {
		if (this.backward) {
			this.activeFrame--;
			if (this.activeFrame < 0)
				this.activeFrame = this.compiledFrames.length-1;
		} else {
			this.activeFrame++;
			if (this.activeFrame > this.compiledFrames.length-1)
				this.activeFrame = 0;
		}
	}

	this.draw = function (p) {
		var img = this.compiledFrames[this.activeFrame];

		html5.context.save();
		html5.context.translate (p[0],p[1]);

		if (this.flip)
			html5.context.scale(-1,1);

		html5.context.drawImage(img,-img.width/2,-img.height/2);
	
		html5.context.restore();

		this.step();
	}

	this.changeTime = function (time) {
		if (this.timeUntilChange > 5)
			this.timeUntilChange = 0;

		this.timeUntilChange = (Math.abs(time)/this.time)*this.timeUntilChange;
		this.time = Math.abs(time);
		this.backward = time < 0;
	}

	// @constuctor
	this.compileFrames(frames);
}