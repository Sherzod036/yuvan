// ------------- VARIABLES ------------- //
var ticking = false;
var isFirefox = /Firefox/i.test(navigator.userAgent);
var isIe =
	/MSIE/i.test(navigator.userAgent) ||
	/Trident.*rv\:11\./i.test(navigator.userAgent);
var scrollSensitivitySetting = 30; //Increase/decrease this number to change sensitivity to trackpad gestures (up = less sensitive; down = more sensitive)
var slideDurationSetting = 600; //Amount of time for which slide is "locked"
var currentSlideNumber = 0;
var totalSlideNumber = $('.background').length;

// ------------- DETERMINE DELTA/SCROLL DIRECTION ------------- //
function parallaxScroll(evt) {
	if (isFirefox) {
		//Set delta for Firefox
		delta = evt.detail * -120;
	} else if (isIe) {
		//Set delta for IE
		delta = -evt.deltaY;
	} else {
		//Set delta for all other browsers
		delta = evt.wheelDelta;
	}

	if (ticking != true) {
		if (delta <= -scrollSensitivitySetting) {
			//Down scroll
			ticking = true;
			if (currentSlideNumber !== totalSlideNumber - 1) {
				currentSlideNumber++;
				nextItem();
			}
			slideDurationTimeout(slideDurationSetting);
		}
		if (delta >= scrollSensitivitySetting) {
			//Up scroll
			ticking = true;
			if (currentSlideNumber !== 0) {
				currentSlideNumber--;
			}
			previousItem();
			slideDurationTimeout(slideDurationSetting);
		}
	}
}

// ------------- SET TIMEOUT TO TEMPORARILY "LOCK" SLIDES ------------- //
function slideDurationTimeout(slideDuration) {
	setTimeout(function () {
		ticking = false;
	}, slideDuration);
}

// ------------- ADD EVENT LISTENER ------------- //
var mousewheelEvent = isFirefox ? 'DOMMouseScroll' : 'wheel';
window.addEventListener(mousewheelEvent, _.throttle(parallaxScroll, 60), false);

// ------------- SLIDE MOTION ------------- //
function nextItem() {
	var $previousSlide = $('.background').eq(currentSlideNumber - 1);
	$previousSlide.removeClass('up-scroll').addClass('down-scroll');
}

function previousItem() {
	var $currentSlide = $('.background').eq(currentSlideNumber);
	$currentSlide.removeClass('down-scroll').addClass('up-scroll');
}

/*
 * decaffeinate suggestions:
 * DS206: Consider reworking classes to avoid initClass
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Dial {
	static initClass() {
		this.prototype.raf = null;
		this.prototype.mdown = false;

		this.prototype.mPos = {
			x: 0,
			y: 0,
		};

		this.prototype.elementPosition = {
			x: 0,
			y: 0,
		};

		this.prototype.target = 0;
		this.prototype.steps = 100;
		this.prototype.radius = 150;
		this.prototype.maxDiff = 150;
		this.prototype.constraint = 360;
		this.prototype.currentVal = 0;
	}

	constructor($context) {
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.$context = $context;
		this.$knob = this.$context.find('.knob');
		this.$handle = this.$context.find('.handle');
		this.$progress = this.$context.find('.progress');
		this.$center = this.$context.find('.center');
		this.$textOutput = this.$center.find('span');

		this.ctx = this.$progress.get(0).getContext('2d');

		const knobOffset = this.$knob.offset();

		this.elementPosition = {
			x: knobOffset.left,
			y: knobOffset.top,
		};

		this.centerX = this.$progress.width() / 2;
		this.centerY = this.$progress.height() / 2;

		this.canvasSize = this.$progress.width();

		this.addEventListeners();
		this.draw();
	}

	addEventListeners() {
		this.$context.on('mousedown', this.onMouseDown);
		this.$context.on('mousemove', this.onMouseMove);
		$('body').on('mouseup', this.onMouseUp);
	}

	setDialPosition() {
		this.$knob.css({
			transform: `rotate(${this.target}deg)`,
		});

		this.$handle.css({
			transform: `rotate(-${this.target}deg)`,
		});

		this.draw();
	}

	draw() {
		this.$progress.get(0).height = this.canvasSize;
		this.$progress.get(0).width = this.canvasSize;

		this.ctx.save();
		this.ctx.translate(this.centerX, this.centerY);
		this.ctx.rotate(-90 * (Math.PI / 180) - (Math.PI * 2) / this.steps);

		for (let i = 0, end = this.steps - 1; i <= end; i++) {
			this.ctx.beginPath();
			this.ctx.rotate((Math.PI * 2) / this.steps);

			this.ctx.lineWidth = 2;
			this.ctx.lineTo(160, 0);
			this.ctx.lineTo(170, 0);
			if (i <= Math.floor(this.currentVal)) {
				this.ctx.shadowBlur = 10;
				this.ctx.strokeStyle = '#fff';
				this.ctx.shadowColor = '#fff';
				if (i > this.steps * 0.75 && this.currentVal > this.steps * 0.75) {
					this.ctx.strokeStyle = '#ff9306';
					this.ctx.shadowColor = '#ff9306';
				}
				if (i > this.steps * 0.88 && this.currentVal > this.steps * 0.88) {
					this.ctx.strokeStyle = '#ff0606';
					this.ctx.shadowColor = '#ff0606';
				}
			} else {
				this.ctx.strokeStyle = '#444';
				this.ctx.shadowBlur = 0;
				this.ctx.shadowColor = '#fff';
			}

			this.ctx.stroke();
		}

		this.ctx.restore();
	}

	setMousePosition(event) {
		this.mPos = {
			x: event.pageX - this.elementPosition.x,
			y: event.pageY - this.elementPosition.y,
		};

		const atan = Math.atan2(
			this.mPos.x - this.radius,
			this.mPos.y - this.radius
		);
		const target = -atan / (Math.PI / 180) + 180;

		const diff = Math.abs(target - this.target);

		if (diff < this.maxDiff && target < this.constraint) {
			this.target = target;
			this.currentVal = this.map(this.target, 0, 360, 0, this.steps);

			this.setDialPosition();
			this.updateOutput();
		}
	}

	updateOutput() {
		this.$textOutput.text(Math.round(this.currentVal));
	}

	// Callbacks
	onMouseDown(event) {
		this.mdown = true;
	}

	onMouseUp(event) {
		this.mdown = false;
	}

	onMouseMove(event) {
		if (this.mdown) {
			this.setMousePosition(event);
		}
	}

	map(value, low1, high1, low2, high2) {
		return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
	}
}
Dial.initClass();

this.$dial = $('.dial');
const dial = new Dial(this.$dial);
