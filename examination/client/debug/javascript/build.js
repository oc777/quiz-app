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
var options = 0;
var answer;


function Quiz() {
    box.querySelector("h3").innerHTML = "Question:";

    submit.setAttribute("value", "Submit answer");


    submit.addEventListener("click", this.sendAnswer, true);
    //this.getQuestion();
}


Quiz.prototype.getQuestion = function() {

    input.firstChild.remove();

    console.log("get question: " + url);

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {

        if (request.readyState === 4 && request.status === 200) {
            //manage server response
            var response = JSON.parse(request.responseText);

            if (response.nextURL !== undefined) {
                url = response.nextURL;
                if (response.alternatives !== undefined) {
                    //options = response.alternatives.length;
                    options = Object.keys(response.alternatives).length;
                    console.log(options);
                } else {
                    options = 0;
                }
            } else {
                console.log("You won!");    //TODO gameover();
            }


            document.querySelector("#question").textContent = response.question;
            document.querySelector("#status").textContent = "";


            input.innerHTML = "";

            while(input.firstChild) {
                input.removeChild(input.firstChild);
            }

            if (options === 0) {
                //input.replaceChild(answerNinput, input.firstChild);
                input.appendChild(answerNinput);
            } else {

                var i;
                for (i = 0; i < options; i++) {
                    console.log("loop");
                    input.appendChild(answerRinput);
                }

            }
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


    answer = answerNinput.value;

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

/*
 try {
 var request = new XMLHttpRequest();
 request.open("POST", url, true);
 request.setRequestHeader("Content-type", "application/json");
 request.onreadystatechange = function () {
 if (request.readyState === 4 && request.status === 200) {
 callback(request);
 }
 };
 request.send(data);
 } catch (error) {
 console.log("Whoops!");
 }
 */












module.exports = Quiz;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9xdWl6LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFF1aXogPSByZXF1aXJlKFwiLi9xdWl6XCIpO1xuXG52YXIgbmlja25hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5pY2tuYW1lSW5wdXRcIik7XG52YXIgc3VibWl0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdWJtaXRcIik7XG5cbmZ1bmN0aW9uIHN0YXJ0UXVpeigpIHtcbiAgICBzdWJtaXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdldE5pY2tuYW1lLCB0cnVlKTtcbiAgICB2YXIgcSA9IG5ldyBRdWl6KCk7XG4gICAgcS5nZXRRdWVzdGlvbigpO1xufVxuXG5cbmZ1bmN0aW9uIGdldE5pY2tuYW1lKCkge1xuXG4gICAgdmFyIG5hbWUgPSBuaWNrbmFtZS52YWx1ZTtcblxuICAgIGlmIChuYW1lICE9PSBudWxsKSB7XG4gICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXCJuYW1lXCIsIG5hbWUpO1xuICAgICAgICB2YXIgZ3JlZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdyZWV0XCIpO1xuICAgICAgICB2YXIgc2F2ZWROYW1lID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShcIm5hbWVcIik7XG4gICAgICAgIGdyZWV0LnRleHRDb250ZW50ID0gXCJIYWxsbyBcIiArIHNhdmVkTmFtZSArIFwiIVwiO1xuICAgICAgICBuaWNrbmFtZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5pY2tuYW1lKTtcbiAgICAgICAgc3RhcnRRdWl6KCk7XG4gICAgfVxuXG59XG5cbnN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZ2V0Tmlja25hbWUsIHRydWUpO1xuXG5cblxuXG5cbi8qXG52YXIgcXVpeiA9IHJlcXVpcmUoXCIuL3F1aXotdFwiKTtcbnF1aXoucGxheVF1aXooKTtcbiovXG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLy92YXIgQWpheCA9IHJlcXVpcmUoXCIuL3NyYy9hamF4XCIpO1xuXG4vL2ltcG9ydCB0aGUgdGVtcGxhdGVzXG52YXIgdGVtcEFuc3dlck4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFuc3dlck5cIik7XG52YXIgdGVtcEFuc3dlclIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFuc3dlclJcIik7XG5cbnZhciBhbnN3ZXJOID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wQW5zd2VyTi5jb250ZW50LCB0cnVlKTtcbnZhciBhbnN3ZXJSID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wQW5zd2VyUi5jb250ZW50LCB0cnVlKTtcblxudmFyIGFuc3dlck5pbnB1dCA9IGFuc3dlck4ucXVlcnlTZWxlY3RvcihcIiNhbnN3ZXJJbnB1dFwiKTtcbnZhciBhbnN3ZXJSaW5wdXQgPSBhbnN3ZXJSLnF1ZXJ5U2VsZWN0b3IoXCIuYW5zd2VyTXVsdGlwbGVcIik7XG52YXIgbmlja25hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5pY2tuYW1lSW5wdXRcIik7XG5cblxuLy9zZXQgdmFyaWFibGVzXG52YXIgcXVlc3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInF1ZXN0aW9uXCIpO1xudmFyIGJveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm94XCIpO1xudmFyIHN1Ym1pdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VibWl0XCIpO1xudmFyIGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbnB1dFwiKTtcblxudmFyIHVybCA9IFwiaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMVwiO1xudmFyIG9wdGlvbnMgPSAwO1xudmFyIGFuc3dlcjtcblxuXG5mdW5jdGlvbiBRdWl6KCkge1xuICAgIGJveC5xdWVyeVNlbGVjdG9yKFwiaDNcIikuaW5uZXJIVE1MID0gXCJRdWVzdGlvbjpcIjtcblxuICAgIHN1Ym1pdC5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBcIlN1Ym1pdCBhbnN3ZXJcIik7XG5cblxuICAgIHN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zZW5kQW5zd2VyLCB0cnVlKTtcbiAgICAvL3RoaXMuZ2V0UXVlc3Rpb24oKTtcbn1cblxuXG5RdWl6LnByb3RvdHlwZS5nZXRRdWVzdGlvbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaW5wdXQuZmlyc3RDaGlsZC5yZW1vdmUoKTtcblxuICAgIGNvbnNvbGUubG9nKFwiZ2V0IHF1ZXN0aW9uOiBcIiArIHVybCk7XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKHJlcXVlc3QucmVhZHlTdGF0ZSA9PT0gNCAmJiByZXF1ZXN0LnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAvL21hbmFnZSBzZXJ2ZXIgcmVzcG9uc2VcbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpO1xuXG4gICAgICAgICAgICBpZiAocmVzcG9uc2UubmV4dFVSTCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gcmVzcG9uc2UubmV4dFVSTDtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuYWx0ZXJuYXRpdmVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9vcHRpb25zID0gcmVzcG9uc2UuYWx0ZXJuYXRpdmVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5rZXlzKHJlc3BvbnNlLmFsdGVybmF0aXZlcykubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiWW91IHdvbiFcIik7ICAgIC8vVE9ETyBnYW1lb3ZlcigpO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcXVlc3Rpb25cIikudGV4dENvbnRlbnQgPSByZXNwb25zZS5xdWVzdGlvbjtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhdHVzXCIpLnRleHRDb250ZW50ID0gXCJcIjtcblxuXG4gICAgICAgICAgICBpbnB1dC5pbm5lckhUTUwgPSBcIlwiO1xuXG4gICAgICAgICAgICB3aGlsZShpbnB1dC5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQucmVtb3ZlQ2hpbGQoaW5wdXQuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy9pbnB1dC5yZXBsYWNlQ2hpbGQoYW5zd2VyTmlucHV0LCBpbnB1dC5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICBpbnB1dC5hcHBlbmRDaGlsZChhbnN3ZXJOaW5wdXQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHZhciBpO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBvcHRpb25zOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJsb29wXCIpO1xuICAgICAgICAgICAgICAgICAgICBpbnB1dC5hcHBlbmRDaGlsZChhbnN3ZXJSaW5wdXQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGF0dXNcIikudGV4dENvbnRlbnQgPSBcIldhaXRpbmcuLi5cIjtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICByZXF1ZXN0LnNlbmQoKTtcblxuICAgIHF1ZXN0aW9uLnRleHRDb250ZW50ID0gXCJcIjtcblxufTtcblxuXG5RdWl6LnByb3RvdHlwZS5zZW5kQW5zd2VyID0gZnVuY3Rpb24oKSB7XG5cbiAgICBjb25zb2xlLmxvZyhcIldob28taG9vOlwiICsgdXJsKTtcbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG5cbiAgICBhbnN3ZXIgPSBhbnN3ZXJOaW5wdXQudmFsdWU7XG5cbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHJlcXVlc3QucmVhZHlTdGF0ZSA9PT0gNCApIHtcblxuXG5cblxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG5cbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5uZXh0VVJMICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSByZXNwb25zZS5uZXh0VVJMO1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5tZXNzYWdlID09PSBcIldyb25nIGFuc3dlciEgOihcIikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIllvdSBsb3N0XCIpOyAgICAgLy9UT0RPIGdhbWVvdmVyKClcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubmV4dFVSTCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2VuZCBvZiBxdWl6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIllvdSB3b24hXCIpOyAgICAvL1RPRE8gZ2FtZW92ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IHJlc3BvbnNlLm5leHRVUkw7XG4gICAgICAgICAgICAgICAgICAgICAgICBRdWl6LnByb3RvdHlwZS5nZXRRdWVzdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codXJsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJZb3Ugd29uIVwiKTsgICAgLy9UT0RPIGdhbWVvdmVyKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG5cblxuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9wZW4oXCJQT1NUXCIsIHVybCwgdHJ1ZSk7XG4gICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICByZXF1ZXN0LnNlbmQoSlNPTi5zdHJpbmdpZnkoe1wiYW5zd2VyXCI6IGFuc3dlcn0pKTtcblxufTtcblxuLypcbiB0cnkge1xuIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gcmVxdWVzdC5vcGVuKFwiUE9TVFwiLCB1cmwsIHRydWUpO1xuIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gaWYgKHJlcXVlc3QucmVhZHlTdGF0ZSA9PT0gNCAmJiByZXF1ZXN0LnN0YXR1cyA9PT0gMjAwKSB7XG4gY2FsbGJhY2socmVxdWVzdCk7XG4gfVxuIH07XG4gcmVxdWVzdC5zZW5kKGRhdGEpO1xuIH0gY2F0Y2ggKGVycm9yKSB7XG4gY29uc29sZS5sb2coXCJXaG9vcHMhXCIpO1xuIH1cbiAqL1xuXG5cblxuXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBRdWl6O1xuIl19
