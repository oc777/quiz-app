"use strict";

/**
 * NOT USED
 */

function Timer(duration, display, quiz) {
    this.duration = duration;
    this.display = display;
    this.quiz = quiz;
    this.totalTime = 0;
    this.interval = undefined;
}

Timer.prototype.start = function() {
    this.interval = setInterval(countdown.bind(this), 1000);
    var time = this.duration;
    function countdown() {
        this.totalTime++;

        // show timer in the header
        if(time < 10) {
            this.display.textContent = "0:0" + time;
        } else {
            this.display.textContent = "0:" + time;
        }

        // time elapsed - user looses
        if (time-- <= 0) {
            this.quiz.finish(false);
            this.stopTimer();
        }
    }
};


Timer.prototype.stop = function () {
    clearInterval(this.interval);
    this.display.textContent = "";
};

module.exports = Timer;
