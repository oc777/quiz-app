"use strict";

//var Ajax = require("./src/ajax");

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
    submit.addEventListener("click", this.postAnswer, true);
    this.getQuestion();
    input.firstChild.remove();
}


/**
 * AJAX GET Request
 * response contains question, answer alternatives (optional) and the url to post the answer to
 */
Quiz.prototype.getQuestion = function() {

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {

        if (request.readyState === 4 && request.status === 200) {
            //manage server response
            var response = JSON.parse(request.responseText);

            url = response.nextURL;

            /*
            //????? TODO
            if (response.nextURL !== undefined) {
                url = response.nextURL;

            } else {
                console.log("You won!");    //TODO gameover();
            }
            */

            document.querySelector("#question").textContent = response.question;
            document.querySelector("#status").textContent = "";

            Quiz.prototype.clearIElement(input);
            Quiz.prototype.createInputForm(response);

        }
        else {
            document.querySelector("#status").textContent = "Waiting...";
        }
    };

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

    var request = new XMLHttpRequest();

    // answer for multiple choice question
    if(options) {
        Quiz.prototype.getAlt();
    }
    // answer for simple question
    else {
        answer = inputField.value;
    }

    request.onreadystatechange = function () {
        if (request.readyState === 4 ) {
            var response = JSON.parse(request.responseText);

            // the answer was wrong - user loses
            if (response.message === "Wrong answer! :(") {
                console.log("You lost");     //TODO gameover()
                Quiz.prototype.finish(false);
            }
            // the answer was correct
            else {
                // this was the last the last question - user wins
                if (response.nextURL === undefined) {
                    console.log("You won!");    //TODO gameover();
                    Quiz.prototype.finish(true);
                }
                // get the next question
                else {
                    url = response.nextURL;
                    Quiz.prototype.getQuestion();
                }
            }
        }
    };

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
Quiz.prototype.clearIElement = function(element) {
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



Quiz.prototype.finish = function(winner) {
    Quiz.prototype.clearIElement(box);
    box.appendChild(end);

    var quizStatus = document.getElementById("quizStatus");
    var quizScore = document.getElementById("quizScore");
    var bestScores = document.getElementById("bestScores");

    //show status: win or loose
    if(winner) {
        quizStatus.textContent = "You win!!!";
    } else {
        quizStatus.textContent = "You loose :(";
    }

    //show total time TODO
    quizScore.textContent = "time will be here";

    //show five best
    //TODO

    //get the page layout




};


module.exports = Quiz;
