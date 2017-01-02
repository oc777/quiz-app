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

