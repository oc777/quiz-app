(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Quiz = require("./quiz");

var nickname = document.getElementById("nicknameInput");
var submit = document.getElementById("submit");

/**
 * get the first question of the quiz
 */
function startQuiz() {
    // remove nickname listener
    submit.removeEventListener("click", getNickname, true);
    // start quiz
    var quiz = new Quiz();
    quiz.getQuestion();
}

/**
 * save nickname of current player in session storage
 * and display it in the header of the page during the quiz
 */
function getNickname() {

    var name = nickname.value;

    if (name !== null) {
        sessionStorage.setItem("name", name);
        //var greet = document.getElementById("greet");
        //var savedName = sessionStorage.getItem("name");
        //greet.textContent = "Hallo " + savedName + "!";
        nickname.parentNode.removeChild(nickname);
        startQuiz();
    }

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
function Quiz() {
    box.querySelector("h3").innerHTML = "Question:";
    submit.setAttribute("value", "Submit answer");
    submit.addEventListener("click", this.postAnswer.bind(this), true);
    input.firstChild.remove();

    this.interval = undefined;
    this.totalTime = 0;

}


/**
 * AJAX GET Request
 * response contains question, answer alternatives (optional) and the url to post the answer to
 */
Quiz.prototype.getQuestion = function() {
    this.startTimer(20);

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
                    this.finish(true).bind(this);
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
    var bestScores = document.getElementById("bestScores");

    //show status: win or loose
    if(winner) {
        quizStatus.textContent = "You win!!!";
    } else {
        quizStatus.textContent = "You loose :(";
    }

    quizScore.textContent = this.getTotalTime();

    //show five best
    //TODO






};


Quiz.prototype.startTimer = function(duration) {
    var time = duration;

    this.interval = setInterval(countdown.bind(this), 1000);


    function countdown() {
        this.totalTime++;

        if(time < 10) {
            timer.textContent = "0:0" + time;
        } else {
            timer.textContent = "0:" + time;
        }

        if (time-- <= 0) {
            this.finish(false);
            this.stopTimer();
        }
    }
};

Quiz.prototype.stopTimer = function() {
    timer.textContent = "";
    clearInterval(this.interval);
};

Quiz.prototype.getTotalTime = function() {
    var seconds = this.totalTime;
    console.log(this.totalTime);

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

module.exports = Quiz;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9xdWl6LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBRdWl6ID0gcmVxdWlyZShcIi4vcXVpelwiKTtcblxudmFyIG5pY2tuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuaWNrbmFtZUlucHV0XCIpO1xudmFyIHN1Ym1pdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VibWl0XCIpO1xuXG4vKipcbiAqIGdldCB0aGUgZmlyc3QgcXVlc3Rpb24gb2YgdGhlIHF1aXpcbiAqL1xuZnVuY3Rpb24gc3RhcnRRdWl6KCkge1xuICAgIC8vIHJlbW92ZSBuaWNrbmFtZSBsaXN0ZW5lclxuICAgIHN1Ym1pdC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZ2V0Tmlja25hbWUsIHRydWUpO1xuICAgIC8vIHN0YXJ0IHF1aXpcbiAgICB2YXIgcXVpeiA9IG5ldyBRdWl6KCk7XG4gICAgcXVpei5nZXRRdWVzdGlvbigpO1xufVxuXG4vKipcbiAqIHNhdmUgbmlja25hbWUgb2YgY3VycmVudCBwbGF5ZXIgaW4gc2Vzc2lvbiBzdG9yYWdlXG4gKiBhbmQgZGlzcGxheSBpdCBpbiB0aGUgaGVhZGVyIG9mIHRoZSBwYWdlIGR1cmluZyB0aGUgcXVpelxuICovXG5mdW5jdGlvbiBnZXROaWNrbmFtZSgpIHtcblxuICAgIHZhciBuYW1lID0gbmlja25hbWUudmFsdWU7XG5cbiAgICBpZiAobmFtZSAhPT0gbnVsbCkge1xuICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFwibmFtZVwiLCBuYW1lKTtcbiAgICAgICAgLy92YXIgZ3JlZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdyZWV0XCIpO1xuICAgICAgICAvL3ZhciBzYXZlZE5hbWUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwibmFtZVwiKTtcbiAgICAgICAgLy9ncmVldC50ZXh0Q29udGVudCA9IFwiSGFsbG8gXCIgKyBzYXZlZE5hbWUgKyBcIiFcIjtcbiAgICAgICAgbmlja25hbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuaWNrbmFtZSk7XG4gICAgICAgIHN0YXJ0UXVpeigpO1xuICAgIH1cblxufVxuXG4vLyBsaXN0ZW4gZm9yIG5pY2tuYW1lIHN1Ym1pc3Npb25cbnN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZ2V0Tmlja25hbWUsIHRydWUpO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLy92YXIgQWpheCA9IHJlcXVpcmUoXCIuL3NyYy9hamF4XCIpO1xuLy92YXIgVGltZXIgPSByZXF1aXJlKFwiLi90aW1lclwiKTtcblxuLy8gdGVtcGxhdGUgZm9yIHRoZSBlbmQgb2YgdGhlIHF1aXpcbnZhciB0ZW1wRW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRcIik7XG52YXIgZW5kID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wRW5kLmNvbnRlbnQsIHRydWUpO1xuXG4vLyBlbGVtZW50IHRoYXQgc2hvd3MgY3VycmVudCBxdWVzdGlvblxudmFyIHF1ZXN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJxdWVzdGlvblwiKTtcbi8vIGRpdiB3aXRoIGFsbCB0aGUgYWN0aW9uXG52YXIgYm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib3hcIik7XG4vLyB0aGUgYnV0dG9uXG52YXIgc3VibWl0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdWJtaXRcIik7XG4vLyBkaXYgZm9yIHVzZXIgaW5wdXRcbnZhciBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW5wdXRcIik7XG4vLyBkaXYgZm9yIGNvdW50ZG93blxudmFyIHRpbWVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aW1lclwiKTtcblxuXG52YXIgdXJsID0gXCJodHRwOi8vdmhvc3QzLmxudS5zZToyMDA4MC9xdWVzdGlvbi8xXCI7XG52YXIgb3B0aW9ucyA9IGZhbHNlO1xudmFyIGFuc3dlcjtcbnZhciBpbnB1dEZpZWxkO1xuXG4vKipcbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gUXVpeigpIHtcbiAgICBib3gucXVlcnlTZWxlY3RvcihcImgzXCIpLmlubmVySFRNTCA9IFwiUXVlc3Rpb246XCI7XG4gICAgc3VibWl0LnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIFwiU3VibWl0IGFuc3dlclwiKTtcbiAgICBzdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMucG9zdEFuc3dlci5iaW5kKHRoaXMpLCB0cnVlKTtcbiAgICBpbnB1dC5maXJzdENoaWxkLnJlbW92ZSgpO1xuXG4gICAgdGhpcy5pbnRlcnZhbCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnRvdGFsVGltZSA9IDA7XG5cbn1cblxuXG4vKipcbiAqIEFKQVggR0VUIFJlcXVlc3RcbiAqIHJlc3BvbnNlIGNvbnRhaW5zIHF1ZXN0aW9uLCBhbnN3ZXIgYWx0ZXJuYXRpdmVzIChvcHRpb25hbCkgYW5kIHRoZSB1cmwgdG8gcG9zdCB0aGUgYW5zd2VyIHRvXG4gKi9cblF1aXoucHJvdG90eXBlLmdldFF1ZXN0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdGFydFRpbWVyKDIwKTtcblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmIChyZXF1ZXN0LnJlYWR5U3RhdGUgPT09IDQgJiYgcmVxdWVzdC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgLy9tYW5hZ2Ugc2VydmVyIHJlc3BvbnNlXG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcblxuICAgICAgICAgICAgdXJsID0gcmVzcG9uc2UubmV4dFVSTDtcblxuICAgICAgICAgICAgcXVlc3Rpb24udGV4dENvbnRlbnQgPSByZXNwb25zZS5xdWVzdGlvbjtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhdHVzXCIpLnRleHRDb250ZW50ID0gXCJcIjtcblxuICAgICAgICAgICAgdGhpcy5jbGVhckVsZW1lbnQoaW5wdXQpO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVJbnB1dEZvcm0ocmVzcG9uc2UpO1xuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXR1c1wiKS50ZXh0Q29udGVudCA9IFwiV2FpdGluZy4uLlwiO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgcmVxdWVzdC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgcmVxdWVzdC5zZW5kKCk7XG5cbiAgICBxdWVzdGlvbi50ZXh0Q29udGVudCA9IFwiXCI7XG5cbn07XG5cbi8qKlxuICogQUpBWCBQT1NUIHJlcXVlc3RcbiAqIHNlbmRzIHVzZXIncyBhbnN3ZXJcbiAqIHJlc3BvbnNlIGNvbnRhaW5zIHVybCBmb3IgbmV4dCBxdWVzdGlvbiBpZiB0aGUgYW5zd2VyIGlzIGNvcnJlY3RcbiAqL1xuUXVpei5wcm90b3R5cGUucG9zdEFuc3dlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5zdG9wVGltZXIoKTtcblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBhbnN3ZXIgZm9yIG11bHRpcGxlIGNob2ljZSBxdWVzdGlvblxuICAgIGlmKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5nZXRBbHQoKTtcbiAgICB9XG4gICAgLy8gYW5zd2VyIGZvciBzaW1wbGUgcXVlc3Rpb25cbiAgICBlbHNlIHtcbiAgICAgICAgYW5zd2VyID0gaW5wdXRGaWVsZC52YWx1ZTtcbiAgICB9XG5cbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHJlcXVlc3QucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG5cbiAgICAgICAgICAgIC8vIHRoZSBhbnN3ZXIgd2FzIHdyb25nIC0gdXNlciBsb3Nlc1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm1lc3NhZ2UgPT09IFwiV3JvbmcgYW5zd2VyISA6KFwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5maW5pc2goZmFsc2UpLmJpbmQodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB0aGUgYW5zd2VyIHdhcyBjb3JyZWN0XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIHdhcyB0aGUgbGFzdCBxdWVzdGlvbiAtIHVzZXIgd2luc1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5uZXh0VVJMID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maW5pc2godHJ1ZSkuYmluZCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBuZXh0IHF1ZXN0aW9uXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVybCA9IHJlc3BvbnNlLm5leHRVUkw7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0UXVlc3Rpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICByZXF1ZXN0Lm9wZW4oXCJQT1NUXCIsIHVybCwgdHJ1ZSk7XG4gICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICByZXF1ZXN0LnNlbmQoSlNPTi5zdHJpbmdpZnkoe1wiYW5zd2VyXCI6IGFuc3dlcn0pKTtcblxufTtcblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBpbnB1dCBmb3JtIGZvciB0aGUgYW5zd2VyOlxuICogaW5wdXQgZmllbGQgZm9yIHNpbXBsZSBxdWVzdGlvbnMgYW5kIHJhZGlvIGJ1dHRvbnMgZm9yIG11bHRpcGxlIGNob2ljZSBxdWVzdGlvbnNcbiAqIEBwYXJhbSByZXNwb25zZSBzZW50IGJ5IHNlcnZlciB0byBhcHAncyBHRVQgcmVxdWVzdFxuICovXG5RdWl6LnByb3RvdHlwZS5jcmVhdGVJbnB1dEZvcm0gPSBmdW5jdGlvbihyZXNwb25zZSkge1xuXG4gICAgLy8gZm9ybSB3aXRoIHJhZGlvIGJ1dHRvbnNcbiAgICBpZiAocmVzcG9uc2UuYWx0ZXJuYXRpdmVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgb3B0aW9ucyA9IHRydWU7XG4gICAgICAgIE9iamVjdC5rZXlzKHJlc3BvbnNlLmFsdGVybmF0aXZlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcblxuICAgICAgICAgICAgdmFyIGlucHV0UmFkaW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgICAgICBpbnB1dFJhZGlvLnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJyYWRpb1wiKTtcbiAgICAgICAgICAgIGlucHV0UmFkaW8uc2V0QXR0cmlidXRlKFwidmFsdWVcIiwga2V5KTtcbiAgICAgICAgICAgIGlucHV0UmFkaW8uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJrZXlcIik7XG4gICAgICAgICAgICBpbnB1dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKSk7XG4gICAgICAgICAgICBpbnB1dC5hcHBlbmRDaGlsZChpbnB1dFJhZGlvKTtcbiAgICAgICAgICAgIHZhciBhbHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShyZXNwb25zZS5hbHRlcm5hdGl2ZXNba2V5XSk7XG4gICAgICAgICAgICBpbnB1dC5hcHBlbmRDaGlsZChhbHQpO1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIikpO1xuICAgICAgICB9KTtcblxuICAgIH1cbiAgICAvLyBmb3JtIHdpdGggc2luZ2xlIGlucHV0IGZpZWxkXG4gICAgZWxzZSB7XG4gICAgICAgIG9wdGlvbnMgPSBmYWxzZTtcbiAgICAgICAgaW5wdXRGaWVsZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgaW5wdXRGaWVsZC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dFwiKTtcbiAgICAgICAgaW5wdXQuYXBwZW5kQ2hpbGQoaW5wdXRGaWVsZCk7XG4gICAgfVxufTtcblxuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGVsZW1lbnRzIGluc2lkZSBhbm90aGVyIERPTSBlbGVtZW50XG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBOb2RlIHRvIGJlIGNsZWFyZWRcbiAqL1xuUXVpei5wcm90b3R5cGUuY2xlYXJFbGVtZW50ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHdoaWxlKGVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBnZXQgdGhlIHVzZXIncyBhbnN3ZXIgZm9yIG11bHRpcGxlIGNob2ljZSBxdWVzdGlvblxuICogKGZpbmQgdGhlIHJhZGlvIGJ1dHRvbiB0aGF0IHdhcyBjaGVja2VkKVxuICovXG5RdWl6LnByb3RvdHlwZS5nZXRBbHQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBlYWNoIHJhZGlvIGJ1dHRvbiBoYXMgY2xhc3MgYXR0cmlidXRlIFwia2V5XCJcbiAgICB2YXIgYWx0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIua2V5XCIpO1xuICAgIHZhciBpO1xuICAgIGZvcihpID0gMDsgaSA8IGFsdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFsdHNbaV0uY2hlY2tlZCkge1xuICAgICAgICAgICAgYW5zd2VyID0gYWx0c1tpXS52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblxuLyoqXG4gKiBTaG93cyB0aGUgc3RhdHVzIGZvciB0aGUgY3VycmVudCBnYW1lXG4gKiBAcGFyYW0gd2lubmVyIHtib29sZWFufVxuICovXG5RdWl6LnByb3RvdHlwZS5maW5pc2ggPSBmdW5jdGlvbih3aW5uZXIpIHtcbiAgICAvL2dldCB0aGUgcGFnZSBsYXlvdXRcbiAgICB0aGlzLmNsZWFyRWxlbWVudChib3gpO1xuICAgIGJveC5hcHBlbmRDaGlsZChlbmQpO1xuXG4gICAgLy9nZXQgdGhlIGVsZW1lbnRzXG4gICAgdmFyIHF1aXpTdGF0dXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInF1aXpTdGF0dXNcIik7XG4gICAgdmFyIHF1aXpTY29yZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicXVpelNjb3JlXCIpO1xuICAgIHZhciBiZXN0U2NvcmVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJiZXN0U2NvcmVzXCIpO1xuXG4gICAgLy9zaG93IHN0YXR1czogd2luIG9yIGxvb3NlXG4gICAgaWYod2lubmVyKSB7XG4gICAgICAgIHF1aXpTdGF0dXMudGV4dENvbnRlbnQgPSBcIllvdSB3aW4hISFcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWl6U3RhdHVzLnRleHRDb250ZW50ID0gXCJZb3UgbG9vc2UgOihcIjtcbiAgICB9XG5cbiAgICBxdWl6U2NvcmUudGV4dENvbnRlbnQgPSB0aGlzLmdldFRvdGFsVGltZSgpO1xuXG4gICAgLy9zaG93IGZpdmUgYmVzdFxuICAgIC8vVE9ET1xuXG5cblxuXG5cblxufTtcblxuXG5RdWl6LnByb3RvdHlwZS5zdGFydFRpbWVyID0gZnVuY3Rpb24oZHVyYXRpb24pIHtcbiAgICB2YXIgdGltZSA9IGR1cmF0aW9uO1xuXG4gICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKGNvdW50ZG93bi5iaW5kKHRoaXMpLCAxMDAwKTtcblxuXG4gICAgZnVuY3Rpb24gY291bnRkb3duKCkge1xuICAgICAgICB0aGlzLnRvdGFsVGltZSsrO1xuXG4gICAgICAgIGlmKHRpbWUgPCAxMCkge1xuICAgICAgICAgICAgdGltZXIudGV4dENvbnRlbnQgPSBcIjA6MFwiICsgdGltZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbWVyLnRleHRDb250ZW50ID0gXCIwOlwiICsgdGltZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aW1lLS0gPD0gMCkge1xuICAgICAgICAgICAgdGhpcy5maW5pc2goZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5zdG9wVGltZXIoKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblF1aXoucHJvdG90eXBlLnN0b3BUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgIHRpbWVyLnRleHRDb250ZW50ID0gXCJcIjtcbiAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xufTtcblxuUXVpei5wcm90b3R5cGUuZ2V0VG90YWxUaW1lID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlY29uZHMgPSB0aGlzLnRvdGFsVGltZTtcbiAgICBjb25zb2xlLmxvZyh0aGlzLnRvdGFsVGltZSk7XG5cbiAgICB2YXIgdG90YWwgPSBcIlwiO1xuICAgIGlmIChzZWNvbmRzID49IDYwKSB7XG4gICAgICAgIHZhciBtaW4gPSBzZWNvbmRzJTYwO1xuICAgICAgICB2YXIgc2VjID0gc2Vjb25kcyAtIDYwKm1pbjtcbiAgICAgICAgdG90YWwgKz0gbWluICsgXCIgbWludXRlcyBhbmQgXCIgKyBzZWM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdG90YWwgKz0gc2Vjb25kcyArIFwiIHNlY29uZHNcIjtcbiAgICB9XG4gICAgcmV0dXJuIHRvdGFsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBRdWl6O1xuIl19
