(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./quiz":2}],2:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9xdWl6LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBRdWl6ID0gcmVxdWlyZShcIi4vcXVpelwiKTtcblxudmFyIG5pY2tuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuaWNrbmFtZUlucHV0XCIpO1xudmFyIHN1Ym1pdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VibWl0XCIpO1xuXG5mdW5jdGlvbiBzdGFydFF1aXooKSB7XG4gICAgc3VibWl0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnZXROaWNrbmFtZSwgdHJ1ZSk7XG4gICAgdmFyIHEgPSBuZXcgUXVpeigpO1xuICAgIHEuZ2V0UXVlc3Rpb24oKTtcbn1cblxuXG5mdW5jdGlvbiBnZXROaWNrbmFtZSgpIHtcblxuICAgIHZhciBuYW1lID0gbmlja25hbWUudmFsdWU7XG5cbiAgICBpZiAobmFtZSAhPT0gbnVsbCkge1xuICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFwibmFtZVwiLCBuYW1lKTtcbiAgICAgICAgdmFyIGdyZWV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJncmVldFwiKTtcbiAgICAgICAgdmFyIHNhdmVkTmFtZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJuYW1lXCIpO1xuICAgICAgICBncmVldC50ZXh0Q29udGVudCA9IFwiSGFsbG8gXCIgKyBzYXZlZE5hbWUgKyBcIiFcIjtcbiAgICAgICAgbmlja25hbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuaWNrbmFtZSk7XG4gICAgICAgIHN0YXJ0UXVpeigpO1xuICAgIH1cblxufVxuXG5zdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdldE5pY2tuYW1lLCB0cnVlKTtcblxuXG5cblxuXG4vKlxudmFyIHF1aXogPSByZXF1aXJlKFwiLi9xdWl6LXRcIik7XG5xdWl6LnBsYXlRdWl6KCk7XG4qL1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vdmFyIEFqYXggPSByZXF1aXJlKFwiLi9zcmMvYWpheFwiKTtcblxuLy9pbXBvcnQgdGhlIHRlbXBsYXRlc1xudmFyIHRlbXBBbnN3ZXJOID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhbnN3ZXJOXCIpO1xudmFyIHRlbXBBbnN3ZXJSID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhbnN3ZXJSXCIpO1xuXG52YXIgYW5zd2VyTiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcEFuc3dlck4uY29udGVudCwgdHJ1ZSk7XG52YXIgYW5zd2VyUiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcEFuc3dlclIuY29udGVudCwgdHJ1ZSk7XG5cbnZhciBhbnN3ZXJOaW5wdXQgPSBhbnN3ZXJOLnF1ZXJ5U2VsZWN0b3IoXCIjYW5zd2VySW5wdXRcIik7XG52YXIgYW5zd2VyUmlucHV0ID0gYW5zd2VyUi5xdWVyeVNlbGVjdG9yKFwiLmFuc3dlck11bHRpcGxlXCIpO1xudmFyIG5pY2tuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuaWNrbmFtZUlucHV0XCIpO1xuXG5cbi8vc2V0IHZhcmlhYmxlc1xudmFyIHF1ZXN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJxdWVzdGlvblwiKTtcbnZhciBib3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJveFwiKTtcbnZhciBzdWJtaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1Ym1pdFwiKTtcbnZhciBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW5wdXRcIik7XG5cbnZhciB1cmwgPSBcImh0dHA6Ly92aG9zdDMubG51LnNlOjIwMDgwL3F1ZXN0aW9uLzFcIjtcbnZhciBvcHRpb25zID0gZmFsc2U7XG52YXIgYW5zd2VyO1xudmFyIGlucHV0RmllbGQ7XG5cblxuZnVuY3Rpb24gUXVpeigpIHtcbiAgICBib3gucXVlcnlTZWxlY3RvcihcImgzXCIpLmlubmVySFRNTCA9IFwiUXVlc3Rpb246XCI7XG4gICAgc3VibWl0LnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIFwiU3VibWl0IGFuc3dlclwiKTtcbiAgICBzdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2VuZEFuc3dlciwgdHJ1ZSk7XG4gICAgLy90aGlzLmdldFF1ZXN0aW9uKCk7XG4gICAgaW5wdXQuZmlyc3RDaGlsZC5yZW1vdmUoKTtcbn1cblxuXG5RdWl6LnByb3RvdHlwZS5nZXRRdWVzdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vY29uc29sZS5sb2coXCJnZXQgcXVlc3Rpb246IFwiICsgdXJsKTtcblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBpZiAocmVxdWVzdC5yZWFkeVN0YXRlID09PSA0ICYmIHJlcXVlc3Quc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIC8vbWFuYWdlIHNlcnZlciByZXNwb25zZVxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG5cbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5uZXh0VVJMICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSByZXNwb25zZS5uZXh0VVJMO1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmFsdGVybmF0aXZlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vb3B0aW9ucyA9IHJlc3BvbnNlLmFsdGVybmF0aXZlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBPYmplY3Qua2V5cyhyZXNwb25zZS5hbHRlcm5hdGl2ZXMpLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiWW91IHdvbiFcIik7ICAgIC8vVE9ETyBnYW1lb3ZlcigpO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcXVlc3Rpb25cIikudGV4dENvbnRlbnQgPSByZXNwb25zZS5xdWVzdGlvbjtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhdHVzXCIpLnRleHRDb250ZW50ID0gXCJcIjtcblxuXG5cbiAgICAgICAgICAgIFF1aXoucHJvdG90eXBlLmNsZWFySW5wdXRGb3JtKCk7XG4gICAgICAgICAgICBRdWl6LnByb3RvdHlwZS5jcmVhdGVJbnB1dEZvcm0ocmVzcG9uc2UpO1xuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXR1c1wiKS50ZXh0Q29udGVudCA9IFwiV2FpdGluZy4uLlwiO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlcXVlc3Qub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpO1xuICAgIHJlcXVlc3Quc2VuZCgpO1xuXG4gICAgcXVlc3Rpb24udGV4dENvbnRlbnQgPSBcIlwiO1xuXG59O1xuXG5cblF1aXoucHJvdG90eXBlLnNlbmRBbnN3ZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIGNvbnNvbGUubG9nKFwiV2hvby1ob286XCIgKyB1cmwpO1xuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cblxuICAgIGlmKG9wdGlvbnMpIHtcbiAgICAgICAgUXVpei5wcm90b3R5cGUuZ2V0QWx0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYW5zd2VyID0gaW5wdXRGaWVsZC52YWx1ZTtcbiAgICB9XG5cbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHJlcXVlc3QucmVhZHlTdGF0ZSA9PT0gNCApIHtcblxuXG5cblxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG5cbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5uZXh0VVJMICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSByZXNwb25zZS5uZXh0VVJMO1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5tZXNzYWdlID09PSBcIldyb25nIGFuc3dlciEgOihcIikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIllvdSBsb3N0XCIpOyAgICAgLy9UT0RPIGdhbWVvdmVyKClcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubmV4dFVSTCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2VuZCBvZiBxdWl6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIllvdSB3b24hXCIpOyAgICAvL1RPRE8gZ2FtZW92ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IHJlc3BvbnNlLm5leHRVUkw7XG4gICAgICAgICAgICAgICAgICAgICAgICBRdWl6LnByb3RvdHlwZS5nZXRRdWVzdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codXJsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJZb3Ugd29uIVwiKTsgICAgLy9UT0RPIGdhbWVvdmVyKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG5cblxuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9wZW4oXCJQT1NUXCIsIHVybCwgdHJ1ZSk7XG4gICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICByZXF1ZXN0LnNlbmQoSlNPTi5zdHJpbmdpZnkoe1wiYW5zd2VyXCI6IGFuc3dlcn0pKTtcblxufTtcblxuUXVpei5wcm90b3R5cGUuY3JlYXRlSW5wdXRGb3JtID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcblxuICAgIGlmIChyZXNwb25zZS5hbHRlcm5hdGl2ZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvKlxuICAgICAgICB2YXIgb3B0aW9ucyA9IE9iamVjdC5rZXlzKHJlc3BvbnNlLmFsdGVybmF0aXZlcykubGVuZ3RoO1xuICAgICAgICB2YXIgaTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG9wdGlvbnM7ICsraSkge1xuICAgICAgICAgICAgdmFyIGlucHV0UmFkaW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgICAgICBpbnB1dFJhZGlvLnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJyYWRpb1wiKTtcbiAgICAgICAgICAgIGlucHV0UmFkaW8uc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJhbHRcIitpKTtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZENoaWxkKGlucHV0UmFkaW8pO1xuICAgICAgICB9XG4gICAgICAgICovXG4gICAgICAgIG9wdGlvbnMgPSB0cnVlO1xuICAgICAgICBPYmplY3Qua2V5cyhyZXNwb25zZS5hbHRlcm5hdGl2ZXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG5cbiAgICAgICAgICAgIHZhciBpbnB1dFJhZGlvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICAgICAgaW5wdXRSYWRpby5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwicmFkaW9cIik7XG4gICAgICAgICAgICBpbnB1dFJhZGlvLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIGtleSk7XG4gICAgICAgICAgICBpbnB1dFJhZGlvLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwia2V5XCIpO1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIikpO1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kQ2hpbGQoaW5wdXRSYWRpbyk7XG4gICAgICAgICAgICB2YXIgYWx0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocmVzcG9uc2UuYWx0ZXJuYXRpdmVzW2tleV0pO1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kQ2hpbGQoYWx0KTtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpKTtcbiAgICAgICAgfSk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICBvcHRpb25zID0gZmFsc2U7XG4gICAgICAgIGlucHV0RmllbGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgIGlucHV0RmllbGQuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcIm51bWJlclwiKTtcbiAgICAgICAgaW5wdXQuYXBwZW5kQ2hpbGQoaW5wdXRGaWVsZCk7XG4gICAgfVxufTtcblxuXG5cblF1aXoucHJvdG90eXBlLmNsZWFySW5wdXRGb3JtID0gZnVuY3Rpb24oKSB7XG4gICAgd2hpbGUoaW5wdXQuZmlyc3RDaGlsZCkge1xuICAgICAgICBpbnB1dC5yZW1vdmVDaGlsZChpbnB1dC5maXJzdENoaWxkKTtcbiAgICB9XG59O1xuXG5RdWl6LnByb3RvdHlwZS5nZXRBbHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYWx0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIua2V5XCIpO1xuICAgIHZhciBpO1xuICAgIGZvcihpID0gMDsgaSA8IGFsdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFsdHNbaV0uY2hlY2tlZCkge1xuICAgICAgICAgICAgYW5zd2VyID0gYWx0c1tpXS52YWx1ZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGFuc3dlcik7XG4gICAgICAgIH1cblxuICAgIH1cbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBRdWl6O1xuIl19
