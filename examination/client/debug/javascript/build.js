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
// top 5 list
//var top = document.getElementById("top");


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
    this.startTimer(5);

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
    var bestScores = document.getElementById("bestScores");

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


Quiz.prototype.storeWinners = function(name, time) {
    var winner = {"name": name, "time": time};
    var winners = [];

    if(localStorage.getItem("winners") !== null) {
        winners = JSON.parse(localStorage.getItem("winners"));
    }
    winners.push(winner);
    winners.sort(function(a,b){
        return a.time - b.time;
    });
    if (winners.length > 5) {
        winners.pop();
    }
    var json = JSON.stringify(winners);
    localStorage.setItem("winners", json);
};

Quiz.prototype.showWinners = function() {
    if(localStorage.getItem("winners") !== null) {
        var json = JSON.parse(localStorage.getItem("winners"))
        //var winners = json;
        for(var i = 0; i < json.length; i++) {
            var name = json[i].name;
            var time = json[i].time;
            console.log("Name: "+name+"; Time: "+time);

            var ol = document.getElementById(i);
            ol.innerHTML = name.toUpperCase() + " : " + time + " seconds";
        }
    }
};


module.exports = Quiz;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9xdWl6LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgUXVpeiA9IHJlcXVpcmUoXCIuL3F1aXpcIik7XG5cbnZhciBuaWNrbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmlja25hbWVJbnB1dFwiKTtcbnZhciBzdWJtaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1Ym1pdFwiKTtcblxuLyoqXG4gKiBnZXQgdGhlIGZpcnN0IHF1ZXN0aW9uIG9mIHRoZSBxdWl6XG4gKi9cbmZ1bmN0aW9uIHN0YXJ0UXVpeigpIHtcbiAgICAvLyByZW1vdmUgbmlja25hbWUgbGlzdGVuZXJcbiAgICBzdWJtaXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdldE5pY2tuYW1lLCB0cnVlKTtcbiAgICAvLyBzdGFydCBxdWl6XG4gICAgdmFyIHF1aXogPSBuZXcgUXVpeigpO1xuICAgIHF1aXouZ2V0UXVlc3Rpb24oKTtcbn1cblxuLyoqXG4gKiBzYXZlIG5pY2tuYW1lIG9mIGN1cnJlbnQgcGxheWVyIGluIHNlc3Npb24gc3RvcmFnZVxuICogYW5kIGRpc3BsYXkgaXQgaW4gdGhlIGhlYWRlciBvZiB0aGUgcGFnZSBkdXJpbmcgdGhlIHF1aXpcbiAqL1xuZnVuY3Rpb24gZ2V0Tmlja25hbWUoKSB7XG5cbiAgICB2YXIgbmFtZSA9IG5pY2tuYW1lLnZhbHVlO1xuXG4gICAgaWYgKG5hbWUgIT09IG51bGwpIHtcbiAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShcIm5hbWVcIiwgbmFtZSk7XG4gICAgICAgIC8vdmFyIGdyZWV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJncmVldFwiKTtcbiAgICAgICAgLy92YXIgc2F2ZWROYW1lID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShcIm5hbWVcIik7XG4gICAgICAgIC8vZ3JlZXQudGV4dENvbnRlbnQgPSBcIkhhbGxvIFwiICsgc2F2ZWROYW1lICsgXCIhXCI7XG4gICAgICAgIG5pY2tuYW1lLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobmlja25hbWUpO1xuICAgICAgICBzdGFydFF1aXooKTtcbiAgICB9XG5cbn1cblxuLy8gbGlzdGVuIGZvciBuaWNrbmFtZSBzdWJtaXNzaW9uXG5zdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdldE5pY2tuYW1lLCB0cnVlKTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vdmFyIEFqYXggPSByZXF1aXJlKFwiLi9zcmMvYWpheFwiKTtcbi8vdmFyIFRpbWVyID0gcmVxdWlyZShcIi4vdGltZXJcIik7XG5cbi8vIHRlbXBsYXRlIGZvciB0aGUgZW5kIG9mIHRoZSBxdWl6XG52YXIgdGVtcEVuZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5kXCIpO1xudmFyIGVuZCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcEVuZC5jb250ZW50LCB0cnVlKTtcbi8vIHRvcCA1IGxpc3Rcbi8vdmFyIHRvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9wXCIpO1xuXG5cbi8vIGVsZW1lbnQgdGhhdCBzaG93cyBjdXJyZW50IHF1ZXN0aW9uXG52YXIgcXVlc3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInF1ZXN0aW9uXCIpO1xuLy8gZGl2IHdpdGggYWxsIHRoZSBhY3Rpb25cbnZhciBib3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJveFwiKTtcbi8vIHRoZSBidXR0b25cbnZhciBzdWJtaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1Ym1pdFwiKTtcbi8vIGRpdiBmb3IgdXNlciBpbnB1dFxudmFyIGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbnB1dFwiKTtcbi8vIGRpdiBmb3IgY291bnRkb3duXG52YXIgdGltZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpbWVyXCIpO1xuXG5cblxudmFyIHVybCA9IFwiaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMVwiO1xudmFyIG9wdGlvbnMgPSBmYWxzZTtcbnZhciBhbnN3ZXI7XG52YXIgaW5wdXRGaWVsZDtcblxuLyoqXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFF1aXooKSB7XG4gICAgYm94LnF1ZXJ5U2VsZWN0b3IoXCJoM1wiKS5pbm5lckhUTUwgPSBcIlF1ZXN0aW9uOlwiO1xuICAgIHN1Ym1pdC5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBcIlN1Ym1pdCBhbnN3ZXJcIik7XG4gICAgc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnBvc3RBbnN3ZXIuYmluZCh0aGlzKSwgdHJ1ZSk7XG4gICAgaW5wdXQuZmlyc3RDaGlsZC5yZW1vdmUoKTtcblxuICAgIHRoaXMuaW50ZXJ2YWwgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy50b3RhbFRpbWUgPSAwO1xuXG59XG5cblxuLyoqXG4gKiBBSkFYIEdFVCBSZXF1ZXN0XG4gKiByZXNwb25zZSBjb250YWlucyBxdWVzdGlvbiwgYW5zd2VyIGFsdGVybmF0aXZlcyAob3B0aW9uYWwpIGFuZCB0aGUgdXJsIHRvIHBvc3QgdGhlIGFuc3dlciB0b1xuICovXG5RdWl6LnByb3RvdHlwZS5nZXRRdWVzdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3RhcnRUaW1lcig1KTtcblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmIChyZXF1ZXN0LnJlYWR5U3RhdGUgPT09IDQgJiYgcmVxdWVzdC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgLy9tYW5hZ2Ugc2VydmVyIHJlc3BvbnNlXG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcblxuICAgICAgICAgICAgdXJsID0gcmVzcG9uc2UubmV4dFVSTDtcblxuICAgICAgICAgICAgcXVlc3Rpb24udGV4dENvbnRlbnQgPSByZXNwb25zZS5xdWVzdGlvbjtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhdHVzXCIpLnRleHRDb250ZW50ID0gXCJcIjtcblxuICAgICAgICAgICAgdGhpcy5jbGVhckVsZW1lbnQoaW5wdXQpO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVJbnB1dEZvcm0ocmVzcG9uc2UpO1xuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXR1c1wiKS50ZXh0Q29udGVudCA9IFwiV2FpdGluZy4uLlwiO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgcmVxdWVzdC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgcmVxdWVzdC5zZW5kKCk7XG5cbiAgICBxdWVzdGlvbi50ZXh0Q29udGVudCA9IFwiXCI7XG5cbn07XG5cbi8qKlxuICogQUpBWCBQT1NUIHJlcXVlc3RcbiAqIHNlbmRzIHVzZXIncyBhbnN3ZXJcbiAqIHJlc3BvbnNlIGNvbnRhaW5zIHVybCBmb3IgbmV4dCBxdWVzdGlvbiBpZiB0aGUgYW5zd2VyIGlzIGNvcnJlY3RcbiAqL1xuUXVpei5wcm90b3R5cGUucG9zdEFuc3dlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5zdG9wVGltZXIoKTtcblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBhbnN3ZXIgZm9yIG11bHRpcGxlIGNob2ljZSBxdWVzdGlvblxuICAgIGlmKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5nZXRBbHQoKTtcbiAgICB9XG4gICAgLy8gYW5zd2VyIGZvciBzaW1wbGUgcXVlc3Rpb25cbiAgICBlbHNlIHtcbiAgICAgICAgYW5zd2VyID0gaW5wdXRGaWVsZC52YWx1ZTtcbiAgICB9XG5cbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHJlcXVlc3QucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG5cbiAgICAgICAgICAgIC8vIHRoZSBhbnN3ZXIgd2FzIHdyb25nIC0gdXNlciBsb3Nlc1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm1lc3NhZ2UgPT09IFwiV3JvbmcgYW5zd2VyISA6KFwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5maW5pc2goZmFsc2UpLmJpbmQodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB0aGUgYW5zd2VyIHdhcyBjb3JyZWN0XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIHdhcyB0aGUgbGFzdCBxdWVzdGlvbiAtIHVzZXIgd2luc1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5uZXh0VVJMID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maW5pc2godHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgbmV4dCBxdWVzdGlvblxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1cmwgPSByZXNwb25zZS5uZXh0VVJMO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldFF1ZXN0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgcmVxdWVzdC5vcGVuKFwiUE9TVFwiLCB1cmwsIHRydWUpO1xuICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgcmVxdWVzdC5zZW5kKEpTT04uc3RyaW5naWZ5KHtcImFuc3dlclwiOiBhbnN3ZXJ9KSk7XG5cbn07XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgaW5wdXQgZm9ybSBmb3IgdGhlIGFuc3dlcjpcbiAqIGlucHV0IGZpZWxkIGZvciBzaW1wbGUgcXVlc3Rpb25zIGFuZCByYWRpbyBidXR0b25zIGZvciBtdWx0aXBsZSBjaG9pY2UgcXVlc3Rpb25zXG4gKiBAcGFyYW0gcmVzcG9uc2Ugc2VudCBieSBzZXJ2ZXIgdG8gYXBwJ3MgR0VUIHJlcXVlc3RcbiAqL1xuUXVpei5wcm90b3R5cGUuY3JlYXRlSW5wdXRGb3JtID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcblxuICAgIC8vIGZvcm0gd2l0aCByYWRpbyBidXR0b25zXG4gICAgaWYgKHJlc3BvbnNlLmFsdGVybmF0aXZlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG9wdGlvbnMgPSB0cnVlO1xuICAgICAgICBPYmplY3Qua2V5cyhyZXNwb25zZS5hbHRlcm5hdGl2ZXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG5cbiAgICAgICAgICAgIHZhciBpbnB1dFJhZGlvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICAgICAgaW5wdXRSYWRpby5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwicmFkaW9cIik7XG4gICAgICAgICAgICBpbnB1dFJhZGlvLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIGtleSk7XG4gICAgICAgICAgICBpbnB1dFJhZGlvLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwia2V5XCIpO1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIikpO1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kQ2hpbGQoaW5wdXRSYWRpbyk7XG4gICAgICAgICAgICB2YXIgYWx0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocmVzcG9uc2UuYWx0ZXJuYXRpdmVzW2tleV0pO1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kQ2hpbGQoYWx0KTtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpKTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG4gICAgLy8gZm9ybSB3aXRoIHNpbmdsZSBpbnB1dCBmaWVsZFxuICAgIGVsc2Uge1xuICAgICAgICBvcHRpb25zID0gZmFsc2U7XG4gICAgICAgIGlucHV0RmllbGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgIGlucHV0RmllbGQuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcInRleHRcIik7XG4gICAgICAgIGlucHV0LmFwcGVuZENoaWxkKGlucHV0RmllbGQpO1xuICAgIH1cbn07XG5cblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBlbGVtZW50cyBpbnNpZGUgYW5vdGhlciBET00gZWxlbWVudFxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgTm9kZSB0byBiZSBjbGVhcmVkXG4gKi9cblF1aXoucHJvdG90eXBlLmNsZWFyRWxlbWVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICB3aGlsZShlbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cbn07XG5cbi8qKlxuICogZ2V0IHRoZSB1c2VyJ3MgYW5zd2VyIGZvciBtdWx0aXBsZSBjaG9pY2UgcXVlc3Rpb25cbiAqIChmaW5kIHRoZSByYWRpbyBidXR0b24gdGhhdCB3YXMgY2hlY2tlZClcbiAqL1xuUXVpei5wcm90b3R5cGUuZ2V0QWx0ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gZWFjaCByYWRpbyBidXR0b24gaGFzIGNsYXNzIGF0dHJpYnV0ZSBcImtleVwiXG4gICAgdmFyIGFsdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmtleVwiKTtcbiAgICB2YXIgaTtcbiAgICBmb3IoaSA9IDA7IGkgPCBhbHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhbHRzW2ldLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGFuc3dlciA9IGFsdHNbaV0udmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5cbi8qKlxuICogU2hvd3MgdGhlIHN0YXR1cyBmb3IgdGhlIGN1cnJlbnQgZ2FtZVxuICogQHBhcmFtIHdpbm5lciB7Ym9vbGVhbn1cbiAqL1xuUXVpei5wcm90b3R5cGUuZmluaXNoID0gZnVuY3Rpb24od2lubmVyKSB7XG4gICAgLy9nZXQgdGhlIHBhZ2UgbGF5b3V0XG4gICAgdGhpcy5jbGVhckVsZW1lbnQoYm94KTtcbiAgICBib3guYXBwZW5kQ2hpbGQoZW5kKTtcblxuICAgIC8vZ2V0IHRoZSBlbGVtZW50c1xuICAgIHZhciBxdWl6U3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJxdWl6U3RhdHVzXCIpO1xuICAgIHZhciBxdWl6U2NvcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInF1aXpTY29yZVwiKTtcbiAgICB2YXIgYmVzdFNjb3JlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmVzdFNjb3Jlc1wiKTtcblxuICAgIC8vc2hvdyBzdGF0dXM6IHdpbiBvciBsb29zZVxuICAgIGlmKHdpbm5lcikge1xuICAgICAgICBxdWl6U3RhdHVzLnRleHRDb250ZW50ID0gXCJZb3Ugd2luISEhXCI7XG4gICAgICAgIHZhciBuaWNrbmFtZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJuYW1lXCIpO1xuICAgICAgICB0aGlzLnN0b3JlV2lubmVycyhuaWNrbmFtZSwgdGhpcy50b3RhbFRpbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1aXpTdGF0dXMudGV4dENvbnRlbnQgPSBcIllvdSBsb29zZSA6KFwiO1xuICAgIH1cblxuICAgIHF1aXpTY29yZS50ZXh0Q29udGVudCA9IFwiWW91ciB0b3RhbCB0aW1lOiBcIiArIHRoaXMuZ2V0VG90YWxUaW1lKCk7XG5cbiAgICAvL3Nob3cgdG9wIGZpdmUgc2NvcmVzXG4gICAgdGhpcy5zaG93V2lubmVycygpO1xuXG5cblxufTtcblxuXG5RdWl6LnByb3RvdHlwZS5zdGFydFRpbWVyID0gZnVuY3Rpb24oZHVyYXRpb24pIHtcbiAgICB2YXIgdGltZSA9IGR1cmF0aW9uO1xuXG4gICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKGNvdW50ZG93bi5iaW5kKHRoaXMpLCAxMDAwKTtcblxuXG4gICAgZnVuY3Rpb24gY291bnRkb3duKCkge1xuICAgICAgICB0aGlzLnRvdGFsVGltZSsrO1xuXG4gICAgICAgIGlmKHRpbWUgPCAxMCkge1xuICAgICAgICAgICAgdGltZXIudGV4dENvbnRlbnQgPSBcIjA6MFwiICsgdGltZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbWVyLnRleHRDb250ZW50ID0gXCIwOlwiICsgdGltZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aW1lLS0gPD0gMCkge1xuICAgICAgICAgICAgdGhpcy5maW5pc2goZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5zdG9wVGltZXIoKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblF1aXoucHJvdG90eXBlLnN0b3BUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgIHRpbWVyLnRleHRDb250ZW50ID0gXCJcIjtcbiAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xufTtcblxuUXVpei5wcm90b3R5cGUuZ2V0VG90YWxUaW1lID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlY29uZHMgPSB0aGlzLnRvdGFsVGltZTtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMudG90YWxUaW1lKTtcblxuICAgIHZhciB0b3RhbCA9IFwiXCI7XG4gICAgaWYgKHNlY29uZHMgPj0gNjApIHtcbiAgICAgICAgdmFyIG1pbiA9IHNlY29uZHMlNjA7XG4gICAgICAgIHZhciBzZWMgPSBzZWNvbmRzIC0gNjAqbWluO1xuICAgICAgICB0b3RhbCArPSBtaW4gKyBcIiBtaW51dGVzIGFuZCBcIiArIHNlYztcbiAgICB9IGVsc2Uge1xuICAgICAgICB0b3RhbCArPSBzZWNvbmRzICsgXCIgc2Vjb25kc1wiO1xuICAgIH1cbiAgICByZXR1cm4gdG90YWw7XG59O1xuXG5cblF1aXoucHJvdG90eXBlLnN0b3JlV2lubmVycyA9IGZ1bmN0aW9uKG5hbWUsIHRpbWUpIHtcbiAgICB2YXIgd2lubmVyID0ge1wibmFtZVwiOiBuYW1lLCBcInRpbWVcIjogdGltZX07XG4gICAgdmFyIHdpbm5lcnMgPSBbXTtcblxuICAgIGlmKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwid2lubmVyc1wiKSAhPT0gbnVsbCkge1xuICAgICAgICB3aW5uZXJzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIndpbm5lcnNcIikpO1xuICAgIH1cbiAgICB3aW5uZXJzLnB1c2god2lubmVyKTtcbiAgICB3aW5uZXJzLnNvcnQoZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgcmV0dXJuIGEudGltZSAtIGIudGltZTtcbiAgICB9KTtcbiAgICBpZiAod2lubmVycy5sZW5ndGggPiA1KSB7XG4gICAgICAgIHdpbm5lcnMucG9wKCk7XG4gICAgfVxuICAgIHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnkod2lubmVycyk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ3aW5uZXJzXCIsIGpzb24pO1xufTtcblxuUXVpei5wcm90b3R5cGUuc2hvd1dpbm5lcnMgPSBmdW5jdGlvbigpIHtcbiAgICBpZihsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIndpbm5lcnNcIikgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIGpzb24gPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwid2lubmVyc1wiKSlcbiAgICAgICAgLy92YXIgd2lubmVycyA9IGpzb247XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBqc29uLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IGpzb25baV0ubmFtZTtcbiAgICAgICAgICAgIHZhciB0aW1lID0ganNvbltpXS50aW1lO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJOYW1lOiBcIituYW1lK1wiOyBUaW1lOiBcIit0aW1lKTtcblxuICAgICAgICAgICAgdmFyIG9sID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaSk7XG4gICAgICAgICAgICBvbC5pbm5lckhUTUwgPSBuYW1lLnRvVXBwZXJDYXNlKCkgKyBcIiA6IFwiICsgdGltZSArIFwiIHNlY29uZHNcIjtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBRdWl6O1xuIl19
