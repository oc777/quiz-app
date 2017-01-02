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
