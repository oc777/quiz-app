"use strict";

var Quiz = require("./quiz");

var nickname = document.getElementById("nicknameInput");
var submit = document.getElementById("submit");

function startQuiz() {
    submit.removeEventListener("click", getNickname, true);
    var q = new Quiz();
    q.getQuestion();
}


function getNickname() {

    var name = nickname.value;

    if (name !== null) {
        sessionStorage.setItem("name", name);
        var greet = document.getElementById("greet");
        var savedName = sessionStorage.getItem("name");
        greet.textContent = "Hallo " + savedName + "!";
        nickname.parentNode.removeChild(nickname);
        startQuiz();
    }

}

submit.addEventListener("click", getNickname, true);





/*
var quiz = require("./quiz-t");
quiz.playQuiz();
*/
