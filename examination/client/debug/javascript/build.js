(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Quiz = require("./quiz");
var questionDuration = 10;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9xdWl6LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFF1aXogPSByZXF1aXJlKFwiLi9xdWl6XCIpO1xudmFyIHF1ZXN0aW9uRHVyYXRpb24gPSAxMDtcbnZhciBuaWNrbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmlja25hbWVJbnB1dFwiKTtcbnZhciBzdWJtaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1Ym1pdFwiKTtcbnZhciBzdGF0dXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXR1c1wiKTtcblxuXG5zdGF0dXMuaW5uZXJIVE1MID0gXCJZb3Ugd2lsbCBoYXZlIFwiKyBxdWVzdGlvbkR1cmF0aW9uICsgXCIgc2Vjb25kcyB0byBhbnN3ZXIgZWFjaCBxdWVzdGlvbi5cIjtcbi8vbG9jYWxTdG9yYWdlLmNsZWFyKCk7XG5cbi8qKlxuICogc2F2ZSBuaWNrbmFtZSBvZiBjdXJyZW50IHBsYXllciBpbiBzZXNzaW9uIHN0b3JhZ2VcbiAqIGFuZCBkaXNwbGF5IGl0IGluIHRoZSBoZWFkZXIgb2YgdGhlIHBhZ2UgZHVyaW5nIHRoZSBxdWl6XG4gKi9cbmZ1bmN0aW9uIGdldE5pY2tuYW1lKCkge1xuXG4gICAgdmFyIG5hbWUgPSBuaWNrbmFtZS52YWx1ZTtcblxuICAgIGlmIChuYW1lICE9PSBudWxsKSB7XG4gICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXCJuYW1lXCIsIG5hbWUpO1xuICAgICAgICBuaWNrbmFtZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5pY2tuYW1lKTtcbiAgICAgICAgc3RhcnRRdWl6KCk7XG4gICAgfVxuXG59XG5cbi8qKlxuICogZ2V0IHRoZSBmaXJzdCBxdWVzdGlvbiBvZiB0aGUgcXVpelxuICovXG5mdW5jdGlvbiBzdGFydFF1aXooKSB7XG4gICAgLy8gcmVtb3ZlIG5pY2tuYW1lIGxpc3RlbmVyXG4gICAgc3VibWl0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnZXROaWNrbmFtZSwgdHJ1ZSk7XG4gICAgLy8gc3RhcnQgcXVpelxuICAgIHZhciBxdWl6ID0gbmV3IFF1aXoocXVlc3Rpb25EdXJhdGlvbik7XG4gICAgcXVpei5nZXRRdWVzdGlvbigpO1xufVxuXG5cbi8vIGxpc3RlbiBmb3Igbmlja25hbWUgc3VibWlzc2lvblxuc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnZXROaWNrbmFtZSwgdHJ1ZSk7XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vL3ZhciBBamF4ID0gcmVxdWlyZShcIi4vc3JjL2FqYXhcIik7XG4vL3ZhciBUaW1lciA9IHJlcXVpcmUoXCIuL3RpbWVyXCIpO1xuXG4vLyB0ZW1wbGF0ZSBmb3IgdGhlIGVuZCBvZiB0aGUgcXVpelxudmFyIHRlbXBFbmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFwiKTtcbnZhciBlbmQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBFbmQuY29udGVudCwgdHJ1ZSk7XG5cbi8vIGVsZW1lbnQgdGhhdCBzaG93cyBjdXJyZW50IHF1ZXN0aW9uXG52YXIgcXVlc3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInF1ZXN0aW9uXCIpO1xuLy8gZGl2IHdpdGggYWxsIHRoZSBhY3Rpb25cbnZhciBib3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJveFwiKTtcbi8vIHRoZSBidXR0b25cbnZhciBzdWJtaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1Ym1pdFwiKTtcbi8vIGRpdiBmb3IgdXNlciBpbnB1dFxudmFyIGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbnB1dFwiKTtcbi8vIGRpdiBmb3IgY291bnRkb3duXG52YXIgdGltZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpbWVyXCIpO1xuXG5cblxudmFyIHVybCA9IFwiaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMVwiO1xudmFyIG9wdGlvbnMgPSBmYWxzZTtcbnZhciBhbnN3ZXI7XG52YXIgaW5wdXRGaWVsZDtcblxuLyoqXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFF1aXooZHVyYXRpb24pIHtcbiAgICBib3gucXVlcnlTZWxlY3RvcihcImgzXCIpLmlubmVySFRNTCA9IFwiUXVlc3Rpb246XCI7XG4gICAgc3VibWl0LnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIFwiU3VibWl0IGFuc3dlclwiKTtcbiAgICBzdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMucG9zdEFuc3dlci5iaW5kKHRoaXMpLCB0cnVlKTtcbiAgICBpbnB1dC5maXJzdENoaWxkLnJlbW92ZSgpO1xuXG4gICAgdGhpcy5pbnRlcnZhbCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnRvdGFsVGltZSA9IDA7XG4gICAgdGhpcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuXG59XG5cblxuLyoqXG4gKiBBSkFYIEdFVCBSZXF1ZXN0XG4gKiByZXNwb25zZSBjb250YWlucyBxdWVzdGlvbiwgYW5zd2VyIGFsdGVybmF0aXZlcyAob3B0aW9uYWwpIGFuZCB0aGUgdXJsIHRvIHBvc3QgdGhlIGFuc3dlciB0b1xuICovXG5RdWl6LnByb3RvdHlwZS5nZXRRdWVzdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3RhcnRUaW1lcih0aGlzLmR1cmF0aW9uKTtcblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmIChyZXF1ZXN0LnJlYWR5U3RhdGUgPT09IDQgJiYgcmVxdWVzdC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgLy9tYW5hZ2Ugc2VydmVyIHJlc3BvbnNlXG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcblxuICAgICAgICAgICAgdXJsID0gcmVzcG9uc2UubmV4dFVSTDtcblxuICAgICAgICAgICAgcXVlc3Rpb24udGV4dENvbnRlbnQgPSByZXNwb25zZS5xdWVzdGlvbjtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhdHVzXCIpLnRleHRDb250ZW50ID0gXCJcIjtcblxuICAgICAgICAgICAgdGhpcy5jbGVhckVsZW1lbnQoaW5wdXQpO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVJbnB1dEZvcm0ocmVzcG9uc2UpO1xuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXR1c1wiKS50ZXh0Q29udGVudCA9IFwiV2FpdGluZy4uLlwiO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgcmVxdWVzdC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgcmVxdWVzdC5zZW5kKCk7XG5cbiAgICBxdWVzdGlvbi50ZXh0Q29udGVudCA9IFwiXCI7XG5cbn07XG5cbi8qKlxuICogQUpBWCBQT1NUIHJlcXVlc3RcbiAqIHNlbmRzIHVzZXIncyBhbnN3ZXJcbiAqIHJlc3BvbnNlIGNvbnRhaW5zIHVybCBmb3IgbmV4dCBxdWVzdGlvbiBpZiB0aGUgYW5zd2VyIGlzIGNvcnJlY3RcbiAqL1xuUXVpei5wcm90b3R5cGUucG9zdEFuc3dlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5zdG9wVGltZXIoKTtcblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBhbnN3ZXIgZm9yIG11bHRpcGxlIGNob2ljZSBxdWVzdGlvblxuICAgIGlmKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5nZXRBbHQoKTtcbiAgICB9XG4gICAgLy8gYW5zd2VyIGZvciBzaW1wbGUgcXVlc3Rpb25cbiAgICBlbHNlIHtcbiAgICAgICAgYW5zd2VyID0gaW5wdXRGaWVsZC52YWx1ZTtcbiAgICB9XG5cbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHJlcXVlc3QucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG5cbiAgICAgICAgICAgIC8vIHRoZSBhbnN3ZXIgd2FzIHdyb25nIC0gdXNlciBsb3Nlc1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm1lc3NhZ2UgPT09IFwiV3JvbmcgYW5zd2VyISA6KFwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5maW5pc2goZmFsc2UpLmJpbmQodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB0aGUgYW5zd2VyIHdhcyBjb3JyZWN0XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIHdhcyB0aGUgbGFzdCBxdWVzdGlvbiAtIHVzZXIgd2luc1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5uZXh0VVJMID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maW5pc2godHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgbmV4dCBxdWVzdGlvblxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1cmwgPSByZXNwb25zZS5uZXh0VVJMO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldFF1ZXN0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgcmVxdWVzdC5vcGVuKFwiUE9TVFwiLCB1cmwsIHRydWUpO1xuICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgcmVxdWVzdC5zZW5kKEpTT04uc3RyaW5naWZ5KHtcImFuc3dlclwiOiBhbnN3ZXJ9KSk7XG5cbn07XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgaW5wdXQgZm9ybSBmb3IgdGhlIGFuc3dlcjpcbiAqIGlucHV0IGZpZWxkIGZvciBzaW1wbGUgcXVlc3Rpb25zIGFuZCByYWRpbyBidXR0b25zIGZvciBtdWx0aXBsZSBjaG9pY2UgcXVlc3Rpb25zXG4gKiBAcGFyYW0gcmVzcG9uc2Ugc2VudCBieSBzZXJ2ZXIgdG8gYXBwJ3MgR0VUIHJlcXVlc3RcbiAqL1xuUXVpei5wcm90b3R5cGUuY3JlYXRlSW5wdXRGb3JtID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcblxuICAgIC8vIGZvcm0gd2l0aCByYWRpbyBidXR0b25zXG4gICAgaWYgKHJlc3BvbnNlLmFsdGVybmF0aXZlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG9wdGlvbnMgPSB0cnVlO1xuICAgICAgICBPYmplY3Qua2V5cyhyZXNwb25zZS5hbHRlcm5hdGl2ZXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG5cbiAgICAgICAgICAgIHZhciBpbnB1dFJhZGlvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICAgICAgaW5wdXRSYWRpby5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwicmFkaW9cIik7XG4gICAgICAgICAgICBpbnB1dFJhZGlvLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIGtleSk7XG4gICAgICAgICAgICBpbnB1dFJhZGlvLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwia2V5XCIpO1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIikpO1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kQ2hpbGQoaW5wdXRSYWRpbyk7XG4gICAgICAgICAgICB2YXIgYWx0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocmVzcG9uc2UuYWx0ZXJuYXRpdmVzW2tleV0pO1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kQ2hpbGQoYWx0KTtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpKTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG4gICAgLy8gZm9ybSB3aXRoIHNpbmdsZSBpbnB1dCBmaWVsZFxuICAgIGVsc2Uge1xuICAgICAgICBvcHRpb25zID0gZmFsc2U7XG4gICAgICAgIGlucHV0RmllbGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgIGlucHV0RmllbGQuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcInRleHRcIik7XG4gICAgICAgIGlucHV0LmFwcGVuZENoaWxkKGlucHV0RmllbGQpO1xuICAgIH1cbn07XG5cblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBlbGVtZW50cyBpbnNpZGUgYW5vdGhlciBET00gZWxlbWVudFxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgTm9kZSB0byBiZSBjbGVhcmVkXG4gKi9cblF1aXoucHJvdG90eXBlLmNsZWFyRWxlbWVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICB3aGlsZShlbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cbn07XG5cbi8qKlxuICogZ2V0IHRoZSB1c2VyJ3MgYW5zd2VyIGZvciBtdWx0aXBsZSBjaG9pY2UgcXVlc3Rpb25cbiAqIChmaW5kIHRoZSByYWRpbyBidXR0b24gdGhhdCB3YXMgY2hlY2tlZClcbiAqL1xuUXVpei5wcm90b3R5cGUuZ2V0QWx0ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gZWFjaCByYWRpbyBidXR0b24gaGFzIGNsYXNzIGF0dHJpYnV0ZSBcImtleVwiXG4gICAgdmFyIGFsdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmtleVwiKTtcbiAgICB2YXIgaTtcbiAgICBmb3IoaSA9IDA7IGkgPCBhbHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhbHRzW2ldLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGFuc3dlciA9IGFsdHNbaV0udmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5cbi8qKlxuICogU2hvd3MgdGhlIHN0YXR1cyBmb3IgdGhlIGN1cnJlbnQgZ2FtZVxuICogQHBhcmFtIHdpbm5lciB7Ym9vbGVhbn1cbiAqL1xuUXVpei5wcm90b3R5cGUuZmluaXNoID0gZnVuY3Rpb24od2lubmVyKSB7XG4gICAgLy9nZXQgdGhlIHBhZ2UgbGF5b3V0XG4gICAgdGhpcy5jbGVhckVsZW1lbnQoYm94KTtcbiAgICBib3guYXBwZW5kQ2hpbGQoZW5kKTtcblxuICAgIC8vZ2V0IHRoZSBlbGVtZW50c1xuICAgIHZhciBxdWl6U3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJxdWl6U3RhdHVzXCIpO1xuICAgIHZhciBxdWl6U2NvcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInF1aXpTY29yZVwiKTtcblxuICAgIC8vc2hvdyBzdGF0dXM6IHdpbiBvciBsb29zZVxuICAgIGlmKHdpbm5lcikge1xuICAgICAgICBxdWl6U3RhdHVzLnRleHRDb250ZW50ID0gXCJZb3Ugd2luISEhXCI7XG4gICAgICAgIHZhciBuaWNrbmFtZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJuYW1lXCIpO1xuICAgICAgICB0aGlzLnN0b3JlV2lubmVycyhuaWNrbmFtZSwgdGhpcy50b3RhbFRpbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1aXpTdGF0dXMudGV4dENvbnRlbnQgPSBcIllvdSBsb29zZSA6KFwiO1xuICAgIH1cblxuICAgIHF1aXpTY29yZS50ZXh0Q29udGVudCA9IFwiWW91ciB0b3RhbCB0aW1lOiBcIiArIHRoaXMuZ2V0VG90YWxUaW1lKCk7XG5cbiAgICAvL3Nob3cgdG9wIGZpdmUgc2NvcmVzXG4gICAgdGhpcy5zaG93V2lubmVycygpO1xuXG59O1xuXG4vKipcbiAqIFN0YXJ0cyBjb3VudGRvd24gd2l0aCBvbmUgc2Vjb25kIGludGVydmFsXG4gKiBLZWVwcyB0cmFjayBvZiB0b3RhbCB0aW1lIHNwZW50IGFjdHVhbGx5IHNwZW50XG4gKiBAcGFyYW0gZHVyYXRpb24ge251bWJlcn0gbWF4IHRpbWUgZm9yIG9uZSBxdWVzdGlvblxuICovXG5RdWl6LnByb3RvdHlwZS5zdGFydFRpbWVyID0gZnVuY3Rpb24oZHVyYXRpb24pIHtcbiAgICB2YXIgdGltZSA9IGR1cmF0aW9uO1xuXG4gICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKGNvdW50ZG93bi5iaW5kKHRoaXMpLCAxMDAwKTtcblxuICAgIGZ1bmN0aW9uIGNvdW50ZG93bigpIHtcbiAgICAgICAgdGhpcy50b3RhbFRpbWUrKztcblxuICAgICAgICAvLyBzaG93IHRpbWVyIGluIHRoZSBoZWFkZXJcbiAgICAgICAgaWYodGltZSA8IDEwKSB7XG4gICAgICAgICAgICB0aW1lci50ZXh0Q29udGVudCA9IFwiMDowXCIgKyB0aW1lO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGltZXIudGV4dENvbnRlbnQgPSBcIjA6XCIgKyB0aW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGltZSBlbGFwc2VkIC0gdXNlciBsb29zZXNcbiAgICAgICAgaWYgKHRpbWUtLSA8PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmZpbmlzaChmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnN0b3BUaW1lcigpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBTdG9wcyB0aGUgdGltZXJcbiAqL1xuUXVpei5wcm90b3R5cGUuc3RvcFRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGltZXIudGV4dENvbnRlbnQgPSBcIlwiO1xuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XG59O1xuXG4vKipcbiAqIFBhcnNlcyB0b3RhbCB0aW1lIGluIHNlY29uZHMgdG8gdGltZSBpbiBtaW51dGVzIGFuZCBzZWNvbmRzXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5RdWl6LnByb3RvdHlwZS5nZXRUb3RhbFRpbWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2Vjb25kcyA9IHRoaXMudG90YWxUaW1lO1xuICAgIC8vY29uc29sZS5sb2codGhpcy50b3RhbFRpbWUpO1xuXG4gICAgdmFyIHRvdGFsID0gXCJcIjtcbiAgICBpZiAoc2Vjb25kcyA+PSA2MCkge1xuICAgICAgICB2YXIgbWluID0gc2Vjb25kcyU2MDtcbiAgICAgICAgdmFyIHNlYyA9IHNlY29uZHMgLSA2MCptaW47XG4gICAgICAgIHRvdGFsICs9IG1pbiArIFwiIG1pbnV0ZXMgYW5kIFwiICsgc2VjO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRvdGFsICs9IHNlY29uZHMgKyBcIiBzZWNvbmRzXCI7XG4gICAgfVxuICAgIHJldHVybiB0b3RhbDtcbn07XG5cbi8qKlxuICogU3RvcmVzIHdpbm5lcidzIGluZm8gaW4gTG9jYWwgU3RvcmFnZVxuICogQHBhcmFtIG5hbWUge3N0cmluZ30gdXNlciBuaWNrbmFtZSwgcHJvdmlkZWQgaW4gdGhlIGJlZ2lubmluZyBvZiBzZXNzaW9uXG4gKiBAcGFyYW0gdGltZSB7bnVtYmVyfSB0b3RhbCB0aW1lIGluIHNlY29uZHMgZm9yIHRoaXMgdXNlclxuICovXG5RdWl6LnByb3RvdHlwZS5zdG9yZVdpbm5lcnMgPSBmdW5jdGlvbihuYW1lLCB0aW1lKSB7XG4gICAgdmFyIHdpbm5lciA9IHtcIm5hbWVcIjogbmFtZSwgXCJ0aW1lXCI6IHRpbWV9O1xuICAgIHZhciB3aW5uZXJzID0gW107XG5cbiAgICAvLyBpZiBzb21lIHdpbm5lcnMgd2VyZSBhbHJlYWR5IHN0b3JlZCwgZ2V0IHRoZSBsaXN0IGZpcnN0XG4gICAgaWYobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ3aW5uZXJzXCIpICE9PSBudWxsKSB7XG4gICAgICAgIHdpbm5lcnMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwid2lubmVyc1wiKSk7XG4gICAgfVxuICAgIC8vIGFkZCBjdXJyZW50IHdpbm5lclxuICAgIHdpbm5lcnMucHVzaCh3aW5uZXIpO1xuICAgIC8vIHNvcnQgd2lubmVycyBieSB0aW1lXG4gICAgd2lubmVycy5zb3J0KGZ1bmN0aW9uKGEsYil7XG4gICAgICAgIHJldHVybiBhLnRpbWUgLSBiLnRpbWU7XG4gICAgfSk7XG4gICAgLy8ga2VlcCBtYXggNSB0b3Agc2NvcmVzXG4gICAgaWYgKHdpbm5lcnMubGVuZ3RoID4gNSkge1xuICAgICAgICB3aW5uZXJzLnBvcCgpO1xuICAgIH1cbiAgICAvLyBzdG9yZSB1cGRhdGVkIHdpbm5lcnMgbGlzdFxuICAgIHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnkod2lubmVycyk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ3aW5uZXJzXCIsIGpzb24pO1xufTtcblxuLyoqXG4gKiBEaXNwbGF5cyB0aGUgdG9wIGZpdmUgd2lubmVycyBpbiBsaXN0IGZvcm1cbiAqL1xuUXVpei5wcm90b3R5cGUuc2hvd1dpbm5lcnMgPSBmdW5jdGlvbigpIHtcbiAgICBpZihsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIndpbm5lcnNcIikgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIGpzb24gPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwid2lubmVyc1wiKSk7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBqc29uLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IGpzb25baV0ubmFtZTtcbiAgICAgICAgICAgIHZhciB0aW1lID0ganNvbltpXS50aW1lO1xuXG4gICAgICAgICAgICB2YXIgb2wgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpKTtcbiAgICAgICAgICAgIG9sLmlubmVySFRNTCA9IG5hbWUgKyBcIiA6IFwiICsgdGltZSArIFwiIHNlY29uZHNcIjtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBRdWl6O1xuIl19
