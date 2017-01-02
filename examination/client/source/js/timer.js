"use strict";

/**
 * NOT USED
 */

function Timer(duration, display, quiz) {
    this.duration = duration;
    this.display = display;
    this.quiz = quiz;
    this.total = 0;
    this.interval = undefined;
}

Timer.prototype.start = function() {

    //var that = this;
    this.interval = setInterval(this.countdown.bind(this), 1000);

    /*
    function countdown() {
        display.textContent = "0:" + time;
        this.total++;
        console.log(this.total);
        if (time-- < 0) {
            finish(false);
            clearInterval(this.interval);
        }
    }
    */
};

Timer.prototype.countdown = function() {
    var time = this.duration;
    this.display.textContent = "0:" + time;
    this.total++;
    //console.log(this.total);

    if (time-- < 0) {
        this.quiz.finish(false);
        clearInterval(this.interval);
    }
};

Timer.prototype.stop = function () {
    clearInterval(this.interval);
};

module.exports = Timer;
