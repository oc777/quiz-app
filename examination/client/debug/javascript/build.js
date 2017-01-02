(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Quiz = require("./quiz");

// the duration of each question in seconds
var questionDuration = 20;

var nickname = document.getElementById("nicknameInput");
var submit = document.getElementById("submit");
var status = document.getElementById("status");


status.innerHTML = "You will have "+ questionDuration + " seconds to answer each question.";
//localStorage.clear();

/**
 * save nickname of current player in session storage
 * and display it in the header of the page during the quiz
 */
function getNickname() {

    var name = nickname.value;

    if (name !== null) {
        sessionStorage.setItem("name", name);
        nickname.parentNode.removeChild(nickname);
        startQuiz();
    }

}

/**
 * get the first question of the quiz
 */
function startQuiz() {
    // remove nickname listener
    submit.removeEventListener("click", getNickname, true);
    // start quiz
    var quiz = new Quiz(questionDuration);
    quiz.getQuestion();
}


// listen for nickname submission
submit.addEventListener("click", getNickname, true);


},{"./quiz":2}],2:[function(require,module,exports){
"use strict";

//var Ajax = require("./src/ajax");
//var Timer = require("./timer");

// template for the end of the quiz
var tempEnd = document.getElementById("end");
var end = document.importNode(tempEnd.content, true);

// element that shows current question
var question = document.getElementById("question");
// div with all the action
var box = document.getElementById("box");
// the button
var submit = document.getElementById("submit");
// div for user input
var input = document.getElementById("input");
// div for countdown
var timer = document.getElementById("timer");



var url = "http://vhost3.lnu.se:20080/question/1";
var options = false;
var answer;
var inputField;

/**
 *
 * @constructor
 */
function Quiz(duration) {
    box.querySelector("h3").innerHTML = "Question:";
    submit.setAttribute("value", "Submit answer");
    submit.addEventListener("click", this.postAnswer.bind(this), true);
    input.firstChild.remove();

    this.interval = undefined;
    this.totalTime = 0;
    this.duration = duration;

}


/**
 * AJAX GET Request
 * response contains question, answer alternatives (optional) and the url to post the answer to
 */
Quiz.prototype.getQuestion = function() {
    this.startTimer(this.duration);

    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {

        if (request.readyState === 4 && request.status === 200) {
            //manage server response
            var response = JSON.parse(request.responseText);

            url = response.nextURL;

            question.textContent = response.question;
            document.querySelector("#status").textContent = "";

            this.clearElement(input);
            this.createInputForm(response);

        }
        else {
            document.querySelector("#status").textContent = "Waiting...";
        }
    }.bind(this);

    request.open("GET", url, true);
    request.send();

    question.textContent = "";

};

/**
 * AJAX POST request
 * sends user's answer
 * response contains url for next question if the answer is correct
 */
Quiz.prototype.postAnswer = function() {

    this.stopTimer();

    var request = new XMLHttpRequest();

    // answer for multiple choice question
    if(options) {
        this.getAlt();
    }
    // answer for simple question
    else {
        answer = inputField.value;
    }

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            var response = JSON.parse(request.responseText);

            // the answer was wrong - user loses
            if (response.message === "Wrong answer! :(") {
                this.finish(false).bind(this);
            }
            // the answer was correct
            else {
                // this was the last question - user wins
                if (response.nextURL === undefined) {
                    this.finish(true);
                }
                // get the next question
                else {
                    url = response.nextURL;
                    this.getQuestion();
                }
            }
        }
    }.bind(this);

    request.open("POST", url, true);
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify({"answer": answer}));

};

/**
 * Creates the input form for the answer:
 * input field for simple questions and radio buttons for multiple choice questions
 * @param response sent by server to app's GET request
 */
Quiz.prototype.createInputForm = function(response) {

    // form with radio buttons
    if (response.alternatives !== undefined) {
        options = true;
        Object.keys(response.alternatives).forEach(function(key) {

            var inputRadio = document.createElement("input");
            inputRadio.setAttribute("type", "radio");
            inputRadio.setAttribute("value", key);
            inputRadio.setAttribute("class", "key");
            input.appendChild(document.createElement("span"));
            input.appendChild(inputRadio);
            var alt = document.createTextNode(response.alternatives[key]);
            input.appendChild(alt);
            input.appendChild(document.createElement("span"));
        });

    }
    // form with single input field
    else {
        options = false;
        inputField = document.createElement("input");
        inputField.setAttribute("type", "text");
        input.appendChild(inputField);
    }
};


/**
 * Removes all elements inside another DOM element
 * @param element - the Node to be cleared
 */
Quiz.prototype.clearElement = function(element) {
    while(element.firstChild) {
        element.removeChild(element.firstChild);
    }
};

/**
 * get the user's answer for multiple choice question
 * (find the radio button that was checked)
 */
Quiz.prototype.getAlt = function() {
    // each radio button has class attribute "key"
    var alts = document.querySelectorAll(".key");
    var i;
    for(i = 0; i < alts.length; i++) {
        if (alts[i].checked) {
            answer = alts[i].value;
        }
    }
};


/**
 * Shows the status for the current game
 * @param winner {boolean}
 */
Quiz.prototype.finish = function(winner) {
    //get the page layout
    this.clearElement(box);
    box.appendChild(end);

    //get the elements
    var quizStatus = document.getElementById("quizStatus");
    var quizScore = document.getElementById("quizScore");

    //show status: win or loose
    if(winner) {
        quizStatus.textContent = "You win!!!";
        var nickname = sessionStorage.getItem("name");
        this.storeWinners(nickname, this.totalTime);
    } else {
        quizStatus.textContent = "You loose :(";
    }

    quizScore.textContent = "Your total time: " + this.getTotalTime();

    //show top five scores
    this.showWinners();

};

/**
 * Starts countdown with one second interval
 * Keeps track of total time spent actually spent
 * @param duration {number} max time for one question
 */
Quiz.prototype.startTimer = function(duration) {
    var time = duration;

    this.interval = setInterval(countdown.bind(this), 1000);

    function countdown() {
        this.totalTime++;

        // show timer in the header
        if(time < 10) {
            timer.textContent = "0:0" + time;
        } else {
            timer.textContent = "0:" + time;
        }

        // time elapsed - user looses
        if (time-- <= 0) {
            this.finish(false);
            this.stopTimer();
        }
    }
};

/**
 * Stops the timer
 */
Quiz.prototype.stopTimer = function() {
    timer.textContent = "";
    clearInterval(this.interval);
};

/**
 * Parses total time in seconds to time in minutes and seconds
 * @returns {string}
 */
Quiz.prototype.getTotalTime = function() {
    var seconds = this.totalTime;
    //console.log(this.totalTime);

    var total = "";
    if (seconds >= 60) {
        var min = seconds%60;
        var sec = seconds - 60*min;
        total += min + " minutes and " + sec;
    } else {
        total += seconds + " seconds";
    }
    return total;
};

/**
 * Stores winner's info in Local Storage
 * @param name {string} user nickname, provided in the beginning of session
 * @param time {number} total time in seconds for this user
 */
Quiz.prototype.storeWinners = function(name, time) {
    var winner = {"name": name, "time": time};
    var winners = [];

    // if some winners were already stored, get the list first
    if(localStorage.getItem("winners") !== null) {
        winners = JSON.parse(localStorage.getItem("winners"));
    }
    // add current winner
    winners.push(winner);
    // sort winners by time
    winners.sort(function(a,b){
        return a.time - b.time;
    });
    // keep max 5 top scores
    if (winners.length > 5) {
        winners.pop();
    }
    // store updated winners list
    var json = JSON.stringify(winners);
    localStorage.setItem("winners", json);
};

/**
 * Displays the top five winners in list form
 */
Quiz.prototype.showWinners = function() {
    if(localStorage.getItem("winners") !== null) {
        var json = JSON.parse(localStorage.getItem("winners"));
        for(var i = 0; i < json.length; i++) {
            var name = json[i].name;
            var time = json[i].time;

            var ol = document.getElementById(i);
            ol.innerHTML = name + " : " + time + " seconds";
        }
    }
};


module.exports = Quiz;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9xdWl6LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFF1aXogPSByZXF1aXJlKFwiLi9xdWl6XCIpO1xuXG4vLyB0aGUgZHVyYXRpb24gb2YgZWFjaCBxdWVzdGlvbiBpbiBzZWNvbmRzXG52YXIgcXVlc3Rpb25EdXJhdGlvbiA9IDIwO1xuXG52YXIgbmlja25hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5pY2tuYW1lSW5wdXRcIik7XG52YXIgc3VibWl0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdWJtaXRcIik7XG52YXIgc3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGF0dXNcIik7XG5cblxuc3RhdHVzLmlubmVySFRNTCA9IFwiWW91IHdpbGwgaGF2ZSBcIisgcXVlc3Rpb25EdXJhdGlvbiArIFwiIHNlY29uZHMgdG8gYW5zd2VyIGVhY2ggcXVlc3Rpb24uXCI7XG4vL2xvY2FsU3RvcmFnZS5jbGVhcigpO1xuXG4vKipcbiAqIHNhdmUgbmlja25hbWUgb2YgY3VycmVudCBwbGF5ZXIgaW4gc2Vzc2lvbiBzdG9yYWdlXG4gKiBhbmQgZGlzcGxheSBpdCBpbiB0aGUgaGVhZGVyIG9mIHRoZSBwYWdlIGR1cmluZyB0aGUgcXVpelxuICovXG5mdW5jdGlvbiBnZXROaWNrbmFtZSgpIHtcblxuICAgIHZhciBuYW1lID0gbmlja25hbWUudmFsdWU7XG5cbiAgICBpZiAobmFtZSAhPT0gbnVsbCkge1xuICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFwibmFtZVwiLCBuYW1lKTtcbiAgICAgICAgbmlja25hbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuaWNrbmFtZSk7XG4gICAgICAgIHN0YXJ0UXVpeigpO1xuICAgIH1cblxufVxuXG4vKipcbiAqIGdldCB0aGUgZmlyc3QgcXVlc3Rpb24gb2YgdGhlIHF1aXpcbiAqL1xuZnVuY3Rpb24gc3RhcnRRdWl6KCkge1xuICAgIC8vIHJlbW92ZSBuaWNrbmFtZSBsaXN0ZW5lclxuICAgIHN1Ym1pdC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZ2V0Tmlja25hbWUsIHRydWUpO1xuICAgIC8vIHN0YXJ0IHF1aXpcbiAgICB2YXIgcXVpeiA9IG5ldyBRdWl6KHF1ZXN0aW9uRHVyYXRpb24pO1xuICAgIHF1aXouZ2V0UXVlc3Rpb24oKTtcbn1cblxuXG4vLyBsaXN0ZW4gZm9yIG5pY2tuYW1lIHN1Ym1pc3Npb25cbnN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZ2V0Tmlja25hbWUsIHRydWUpO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLy92YXIgQWpheCA9IHJlcXVpcmUoXCIuL3NyYy9hamF4XCIpO1xuLy92YXIgVGltZXIgPSByZXF1aXJlKFwiLi90aW1lclwiKTtcblxuLy8gdGVtcGxhdGUgZm9yIHRoZSBlbmQgb2YgdGhlIHF1aXpcbnZhciB0ZW1wRW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRcIik7XG52YXIgZW5kID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wRW5kLmNvbnRlbnQsIHRydWUpO1xuXG4vLyBlbGVtZW50IHRoYXQgc2hvd3MgY3VycmVudCBxdWVzdGlvblxudmFyIHF1ZXN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJxdWVzdGlvblwiKTtcbi8vIGRpdiB3aXRoIGFsbCB0aGUgYWN0aW9uXG52YXIgYm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib3hcIik7XG4vLyB0aGUgYnV0dG9uXG52YXIgc3VibWl0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdWJtaXRcIik7XG4vLyBkaXYgZm9yIHVzZXIgaW5wdXRcbnZhciBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW5wdXRcIik7XG4vLyBkaXYgZm9yIGNvdW50ZG93blxudmFyIHRpbWVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aW1lclwiKTtcblxuXG5cbnZhciB1cmwgPSBcImh0dHA6Ly92aG9zdDMubG51LnNlOjIwMDgwL3F1ZXN0aW9uLzFcIjtcbnZhciBvcHRpb25zID0gZmFsc2U7XG52YXIgYW5zd2VyO1xudmFyIGlucHV0RmllbGQ7XG5cbi8qKlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBRdWl6KGR1cmF0aW9uKSB7XG4gICAgYm94LnF1ZXJ5U2VsZWN0b3IoXCJoM1wiKS5pbm5lckhUTUwgPSBcIlF1ZXN0aW9uOlwiO1xuICAgIHN1Ym1pdC5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBcIlN1Ym1pdCBhbnN3ZXJcIik7XG4gICAgc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnBvc3RBbnN3ZXIuYmluZCh0aGlzKSwgdHJ1ZSk7XG4gICAgaW5wdXQuZmlyc3RDaGlsZC5yZW1vdmUoKTtcblxuICAgIHRoaXMuaW50ZXJ2YWwgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy50b3RhbFRpbWUgPSAwO1xuICAgIHRoaXMuZHVyYXRpb24gPSBkdXJhdGlvbjtcblxufVxuXG5cbi8qKlxuICogQUpBWCBHRVQgUmVxdWVzdFxuICogcmVzcG9uc2UgY29udGFpbnMgcXVlc3Rpb24sIGFuc3dlciBhbHRlcm5hdGl2ZXMgKG9wdGlvbmFsKSBhbmQgdGhlIHVybCB0byBwb3N0IHRoZSBhbnN3ZXIgdG9cbiAqL1xuUXVpei5wcm90b3R5cGUuZ2V0UXVlc3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0YXJ0VGltZXIodGhpcy5kdXJhdGlvbik7XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICBpZiAocmVxdWVzdC5yZWFkeVN0YXRlID09PSA0ICYmIHJlcXVlc3Quc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIC8vbWFuYWdlIHNlcnZlciByZXNwb25zZVxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG5cbiAgICAgICAgICAgIHVybCA9IHJlc3BvbnNlLm5leHRVUkw7XG5cbiAgICAgICAgICAgIHF1ZXN0aW9uLnRleHRDb250ZW50ID0gcmVzcG9uc2UucXVlc3Rpb247XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXR1c1wiKS50ZXh0Q29udGVudCA9IFwiXCI7XG5cbiAgICAgICAgICAgIHRoaXMuY2xlYXJFbGVtZW50KGlucHV0KTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlSW5wdXRGb3JtKHJlc3BvbnNlKTtcblxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGF0dXNcIikudGV4dENvbnRlbnQgPSBcIldhaXRpbmcuLi5cIjtcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIHJlcXVlc3Qub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpO1xuICAgIHJlcXVlc3Quc2VuZCgpO1xuXG4gICAgcXVlc3Rpb24udGV4dENvbnRlbnQgPSBcIlwiO1xuXG59O1xuXG4vKipcbiAqIEFKQVggUE9TVCByZXF1ZXN0XG4gKiBzZW5kcyB1c2VyJ3MgYW5zd2VyXG4gKiByZXNwb25zZSBjb250YWlucyB1cmwgZm9yIG5leHQgcXVlc3Rpb24gaWYgdGhlIGFuc3dlciBpcyBjb3JyZWN0XG4gKi9cblF1aXoucHJvdG90eXBlLnBvc3RBbnN3ZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuc3RvcFRpbWVyKCk7XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gYW5zd2VyIGZvciBtdWx0aXBsZSBjaG9pY2UgcXVlc3Rpb25cbiAgICBpZihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuZ2V0QWx0KCk7XG4gICAgfVxuICAgIC8vIGFuc3dlciBmb3Igc2ltcGxlIHF1ZXN0aW9uXG4gICAgZWxzZSB7XG4gICAgICAgIGFuc3dlciA9IGlucHV0RmllbGQudmFsdWU7XG4gICAgfVxuXG4gICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChyZXF1ZXN0LnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpO1xuXG4gICAgICAgICAgICAvLyB0aGUgYW5zd2VyIHdhcyB3cm9uZyAtIHVzZXIgbG9zZXNcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5tZXNzYWdlID09PSBcIldyb25nIGFuc3dlciEgOihcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuZmluaXNoKGZhbHNlKS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGhlIGFuc3dlciB3YXMgY29ycmVjdFxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcyB3YXMgdGhlIGxhc3QgcXVlc3Rpb24gLSB1c2VyIHdpbnNcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubmV4dFVSTCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmluaXNoKHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIG5leHQgcXVlc3Rpb25cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsID0gcmVzcG9uc2UubmV4dFVSTDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRRdWVzdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIHJlcXVlc3Qub3BlbihcIlBPU1RcIiwgdXJsLCB0cnVlKTtcbiAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgIHJlcXVlc3Quc2VuZChKU09OLnN0cmluZ2lmeSh7XCJhbnN3ZXJcIjogYW5zd2VyfSkpO1xuXG59O1xuXG4vKipcbiAqIENyZWF0ZXMgdGhlIGlucHV0IGZvcm0gZm9yIHRoZSBhbnN3ZXI6XG4gKiBpbnB1dCBmaWVsZCBmb3Igc2ltcGxlIHF1ZXN0aW9ucyBhbmQgcmFkaW8gYnV0dG9ucyBmb3IgbXVsdGlwbGUgY2hvaWNlIHF1ZXN0aW9uc1xuICogQHBhcmFtIHJlc3BvbnNlIHNlbnQgYnkgc2VydmVyIHRvIGFwcCdzIEdFVCByZXF1ZXN0XG4gKi9cblF1aXoucHJvdG90eXBlLmNyZWF0ZUlucHV0Rm9ybSA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cbiAgICAvLyBmb3JtIHdpdGggcmFkaW8gYnV0dG9uc1xuICAgIGlmIChyZXNwb25zZS5hbHRlcm5hdGl2ZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvcHRpb25zID0gdHJ1ZTtcbiAgICAgICAgT2JqZWN0LmtleXMocmVzcG9uc2UuYWx0ZXJuYXRpdmVzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuXG4gICAgICAgICAgICB2YXIgaW5wdXRSYWRpbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgICAgIGlucHV0UmFkaW8uc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcInJhZGlvXCIpO1xuICAgICAgICAgICAgaW5wdXRSYWRpby5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBrZXkpO1xuICAgICAgICAgICAgaW5wdXRSYWRpby5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcImtleVwiKTtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpKTtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZENoaWxkKGlucHV0UmFkaW8pO1xuICAgICAgICAgICAgdmFyIGFsdCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHJlc3BvbnNlLmFsdGVybmF0aXZlc1trZXldKTtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZENoaWxkKGFsdCk7XG4gICAgICAgICAgICBpbnB1dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKSk7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuICAgIC8vIGZvcm0gd2l0aCBzaW5nbGUgaW5wdXQgZmllbGRcbiAgICBlbHNlIHtcbiAgICAgICAgb3B0aW9ucyA9IGZhbHNlO1xuICAgICAgICBpbnB1dEZpZWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICBpbnB1dEZpZWxkLnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJ0ZXh0XCIpO1xuICAgICAgICBpbnB1dC5hcHBlbmRDaGlsZChpbnB1dEZpZWxkKTtcbiAgICB9XG59O1xuXG5cbi8qKlxuICogUmVtb3ZlcyBhbGwgZWxlbWVudHMgaW5zaWRlIGFub3RoZXIgRE9NIGVsZW1lbnRcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIE5vZGUgdG8gYmUgY2xlYXJlZFxuICovXG5RdWl6LnByb3RvdHlwZS5jbGVhckVsZW1lbnQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgd2hpbGUoZWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIGdldCB0aGUgdXNlcidzIGFuc3dlciBmb3IgbXVsdGlwbGUgY2hvaWNlIHF1ZXN0aW9uXG4gKiAoZmluZCB0aGUgcmFkaW8gYnV0dG9uIHRoYXQgd2FzIGNoZWNrZWQpXG4gKi9cblF1aXoucHJvdG90eXBlLmdldEFsdCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIGVhY2ggcmFkaW8gYnV0dG9uIGhhcyBjbGFzcyBhdHRyaWJ1dGUgXCJrZXlcIlxuICAgIHZhciBhbHRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5rZXlcIik7XG4gICAgdmFyIGk7XG4gICAgZm9yKGkgPSAwOyBpIDwgYWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYWx0c1tpXS5jaGVja2VkKSB7XG4gICAgICAgICAgICBhbnN3ZXIgPSBhbHRzW2ldLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuXG4vKipcbiAqIFNob3dzIHRoZSBzdGF0dXMgZm9yIHRoZSBjdXJyZW50IGdhbWVcbiAqIEBwYXJhbSB3aW5uZXIge2Jvb2xlYW59XG4gKi9cblF1aXoucHJvdG90eXBlLmZpbmlzaCA9IGZ1bmN0aW9uKHdpbm5lcikge1xuICAgIC8vZ2V0IHRoZSBwYWdlIGxheW91dFxuICAgIHRoaXMuY2xlYXJFbGVtZW50KGJveCk7XG4gICAgYm94LmFwcGVuZENoaWxkKGVuZCk7XG5cbiAgICAvL2dldCB0aGUgZWxlbWVudHNcbiAgICB2YXIgcXVpelN0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicXVpelN0YXR1c1wiKTtcbiAgICB2YXIgcXVpelNjb3JlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJxdWl6U2NvcmVcIik7XG5cbiAgICAvL3Nob3cgc3RhdHVzOiB3aW4gb3IgbG9vc2VcbiAgICBpZih3aW5uZXIpIHtcbiAgICAgICAgcXVpelN0YXR1cy50ZXh0Q29udGVudCA9IFwiWW91IHdpbiEhIVwiO1xuICAgICAgICB2YXIgbmlja25hbWUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwibmFtZVwiKTtcbiAgICAgICAgdGhpcy5zdG9yZVdpbm5lcnMobmlja25hbWUsIHRoaXMudG90YWxUaW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWl6U3RhdHVzLnRleHRDb250ZW50ID0gXCJZb3UgbG9vc2UgOihcIjtcbiAgICB9XG5cbiAgICBxdWl6U2NvcmUudGV4dENvbnRlbnQgPSBcIllvdXIgdG90YWwgdGltZTogXCIgKyB0aGlzLmdldFRvdGFsVGltZSgpO1xuXG4gICAgLy9zaG93IHRvcCBmaXZlIHNjb3Jlc1xuICAgIHRoaXMuc2hvd1dpbm5lcnMoKTtcblxufTtcblxuLyoqXG4gKiBTdGFydHMgY291bnRkb3duIHdpdGggb25lIHNlY29uZCBpbnRlcnZhbFxuICogS2VlcHMgdHJhY2sgb2YgdG90YWwgdGltZSBzcGVudCBhY3R1YWxseSBzcGVudFxuICogQHBhcmFtIGR1cmF0aW9uIHtudW1iZXJ9IG1heCB0aW1lIGZvciBvbmUgcXVlc3Rpb25cbiAqL1xuUXVpei5wcm90b3R5cGUuc3RhcnRUaW1lciA9IGZ1bmN0aW9uKGR1cmF0aW9uKSB7XG4gICAgdmFyIHRpbWUgPSBkdXJhdGlvbjtcblxuICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChjb3VudGRvd24uYmluZCh0aGlzKSwgMTAwMCk7XG5cbiAgICBmdW5jdGlvbiBjb3VudGRvd24oKSB7XG4gICAgICAgIHRoaXMudG90YWxUaW1lKys7XG5cbiAgICAgICAgLy8gc2hvdyB0aW1lciBpbiB0aGUgaGVhZGVyXG4gICAgICAgIGlmKHRpbWUgPCAxMCkge1xuICAgICAgICAgICAgdGltZXIudGV4dENvbnRlbnQgPSBcIjA6MFwiICsgdGltZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbWVyLnRleHRDb250ZW50ID0gXCIwOlwiICsgdGltZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRpbWUgZWxhcHNlZCAtIHVzZXIgbG9vc2VzXG4gICAgICAgIGlmICh0aW1lLS0gPD0gMCkge1xuICAgICAgICAgICAgdGhpcy5maW5pc2goZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5zdG9wVGltZXIoKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogU3RvcHMgdGhlIHRpbWVyXG4gKi9cblF1aXoucHJvdG90eXBlLnN0b3BUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgIHRpbWVyLnRleHRDb250ZW50ID0gXCJcIjtcbiAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xufTtcblxuLyoqXG4gKiBQYXJzZXMgdG90YWwgdGltZSBpbiBzZWNvbmRzIHRvIHRpbWUgaW4gbWludXRlcyBhbmQgc2Vjb25kc1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuUXVpei5wcm90b3R5cGUuZ2V0VG90YWxUaW1lID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlY29uZHMgPSB0aGlzLnRvdGFsVGltZTtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMudG90YWxUaW1lKTtcblxuICAgIHZhciB0b3RhbCA9IFwiXCI7XG4gICAgaWYgKHNlY29uZHMgPj0gNjApIHtcbiAgICAgICAgdmFyIG1pbiA9IHNlY29uZHMlNjA7XG4gICAgICAgIHZhciBzZWMgPSBzZWNvbmRzIC0gNjAqbWluO1xuICAgICAgICB0b3RhbCArPSBtaW4gKyBcIiBtaW51dGVzIGFuZCBcIiArIHNlYztcbiAgICB9IGVsc2Uge1xuICAgICAgICB0b3RhbCArPSBzZWNvbmRzICsgXCIgc2Vjb25kc1wiO1xuICAgIH1cbiAgICByZXR1cm4gdG90YWw7XG59O1xuXG4vKipcbiAqIFN0b3JlcyB3aW5uZXIncyBpbmZvIGluIExvY2FsIFN0b3JhZ2VcbiAqIEBwYXJhbSBuYW1lIHtzdHJpbmd9IHVzZXIgbmlja25hbWUsIHByb3ZpZGVkIGluIHRoZSBiZWdpbm5pbmcgb2Ygc2Vzc2lvblxuICogQHBhcmFtIHRpbWUge251bWJlcn0gdG90YWwgdGltZSBpbiBzZWNvbmRzIGZvciB0aGlzIHVzZXJcbiAqL1xuUXVpei5wcm90b3R5cGUuc3RvcmVXaW5uZXJzID0gZnVuY3Rpb24obmFtZSwgdGltZSkge1xuICAgIHZhciB3aW5uZXIgPSB7XCJuYW1lXCI6IG5hbWUsIFwidGltZVwiOiB0aW1lfTtcbiAgICB2YXIgd2lubmVycyA9IFtdO1xuXG4gICAgLy8gaWYgc29tZSB3aW5uZXJzIHdlcmUgYWxyZWFkeSBzdG9yZWQsIGdldCB0aGUgbGlzdCBmaXJzdFxuICAgIGlmKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwid2lubmVyc1wiKSAhPT0gbnVsbCkge1xuICAgICAgICB3aW5uZXJzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIndpbm5lcnNcIikpO1xuICAgIH1cbiAgICAvLyBhZGQgY3VycmVudCB3aW5uZXJcbiAgICB3aW5uZXJzLnB1c2god2lubmVyKTtcbiAgICAvLyBzb3J0IHdpbm5lcnMgYnkgdGltZVxuICAgIHdpbm5lcnMuc29ydChmdW5jdGlvbihhLGIpe1xuICAgICAgICByZXR1cm4gYS50aW1lIC0gYi50aW1lO1xuICAgIH0pO1xuICAgIC8vIGtlZXAgbWF4IDUgdG9wIHNjb3Jlc1xuICAgIGlmICh3aW5uZXJzLmxlbmd0aCA+IDUpIHtcbiAgICAgICAgd2lubmVycy5wb3AoKTtcbiAgICB9XG4gICAgLy8gc3RvcmUgdXBkYXRlZCB3aW5uZXJzIGxpc3RcbiAgICB2YXIganNvbiA9IEpTT04uc3RyaW5naWZ5KHdpbm5lcnMpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwid2lubmVyc1wiLCBqc29uKTtcbn07XG5cbi8qKlxuICogRGlzcGxheXMgdGhlIHRvcCBmaXZlIHdpbm5lcnMgaW4gbGlzdCBmb3JtXG4gKi9cblF1aXoucHJvdG90eXBlLnNob3dXaW5uZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ3aW5uZXJzXCIpICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBqc29uID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIndpbm5lcnNcIikpO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwganNvbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG5hbWUgPSBqc29uW2ldLm5hbWU7XG4gICAgICAgICAgICB2YXIgdGltZSA9IGpzb25baV0udGltZTtcblxuICAgICAgICAgICAgdmFyIG9sID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaSk7XG4gICAgICAgICAgICBvbC5pbm5lckhUTUwgPSBuYW1lICsgXCIgOiBcIiArIHRpbWUgKyBcIiBzZWNvbmRzXCI7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUXVpejtcbiJdfQ==
