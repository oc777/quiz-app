"use strict";

//var Ajax = require("./src/ajax");

//import the templates
var tempAnswerN = document.getElementById("answerN");
var tempAnswerR = document.getElementById("answerR");

var answerN = document.importNode(tempAnswerN.content, true);
var answerR = document.importNode(tempAnswerR.content, true);

var answerNinput = answerN.querySelector("#answerInput");
var answerRinput = answerR.querySelector(".answerMultiple");
var nickname = document.getElementById("nicknameInput");


//set variables
var question = document.getElementById("question");
var box = document.getElementById("box");
var submit = document.getElementById("submit");
var input = document.getElementById("input");

var url = "http://vhost3.lnu.se:20080/question/1";
var options = false;
var answer;
var inputField;


function Quiz() {
    box.querySelector("h3").innerHTML = "Question:";
    submit.setAttribute("value", "Submit answer");
    submit.addEventListener("click", this.sendAnswer, true);
    //this.getQuestion();
    input.firstChild.remove();
}


Quiz.prototype.getQuestion = function() {
    //console.log("get question: " + url);

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {

        if (request.readyState === 4 && request.status === 200) {
            //manage server response
            var response = JSON.parse(request.responseText);

            if (response.nextURL !== undefined) {
                url = response.nextURL;
                /*
                if (response.alternatives !== undefined) {
                    //options = response.alternatives.length;
                    options = Object.keys(response.alternatives).length;
                    console.log(options);
                } else {
                    options = 0;
                }
                */
            } else {
                console.log("You won!");    //TODO gameover();
            }


            document.querySelector("#question").textContent = response.question;
            document.querySelector("#status").textContent = "";



            Quiz.prototype.clearInputForm();
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


Quiz.prototype.sendAnswer = function() {

    console.log("Whoo-hoo:" + url);
    var request = new XMLHttpRequest();


    if(options) {
        Quiz.prototype.getAlt();
    } else {
        answer = inputField.value;
    }

    request.onreadystatechange = function () {
        if (request.readyState === 4 ) {




            var response = JSON.parse(request.responseText);

            if (response.nextURL !== undefined) {
                url = response.nextURL;
                if (response.message === "Wrong answer! :(") {
                    console.log("You lost");     //TODO gameover()
                } else {
                    if (response.nextURL === undefined) {
                        //end of quiz
                        console.log("You won!");    //TODO gameover();
                    } else {
                        url = response.nextURL;
                        Quiz.prototype.getQuestion();
                        console.log(url);
                    }
                }
            } else {
                console.log("You won!");    //TODO gameover();
            }

        }



    };

    request.open("POST", url, true);
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify({"answer": answer}));

};

Quiz.prototype.createInputForm = function(response) {

    if (response.alternatives !== undefined) {
        /*
        var options = Object.keys(response.alternatives).length;
        var i;
        for (i = 0; i < options; ++i) {
            var inputRadio = document.createElement("input");
            inputRadio.setAttribute("type", "radio");
            inputRadio.setAttribute("id", "alt"+i);
            input.appendChild(inputRadio);
        }
        */
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

    } else {
        options = false;
        inputField = document.createElement("input");
        inputField.setAttribute("type", "number");
        input.appendChild(inputField);
    }
};



Quiz.prototype.clearInputForm = function() {
    while(input.firstChild) {
        input.removeChild(input.firstChild);
    }
};

Quiz.prototype.getAlt = function() {
    var alts = document.querySelectorAll(".key");
    var i;
    for(i = 0; i < alts.length; i++) {
        if (alts[i].checked) {
            answer = alts[i].value;
            console.log(answer);
        }

    }
};


module.exports = Quiz;
