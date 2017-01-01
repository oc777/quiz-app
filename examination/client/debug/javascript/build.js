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
    new Quiz();
    //q.getQuestion();
}

/**
 * save nickname of current player in session storage
 * and display it in the header of the page during the quiz
 */
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

// listen for nickname submission
submit.addEventListener("click", getNickname, true);


},{"./quiz":2}],2:[function(require,module,exports){
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

            //????? TODO
            if (response.nextURL !== undefined) {
                url = response.nextURL;

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
            }
            // the answer was correct
            else {
                // this was the last the last question - user wins
                if (response.nextURL === undefined) {
                    console.log("You won!");    //TODO gameover();
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
 * Removes all elements in input div
 * (text input field or radio buttons)
 */
Quiz.prototype.clearInputForm = function() {
    while(input.firstChild) {
        input.removeChild(input.firstChild);
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


module.exports = Quiz;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9xdWl6LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFF1aXogPSByZXF1aXJlKFwiLi9xdWl6XCIpO1xuXG52YXIgbmlja25hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5pY2tuYW1lSW5wdXRcIik7XG52YXIgc3VibWl0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdWJtaXRcIik7XG5cbi8qKlxuICogZ2V0IHRoZSBmaXJzdCBxdWVzdGlvbiBvZiB0aGUgcXVpelxuICovXG5mdW5jdGlvbiBzdGFydFF1aXooKSB7XG4gICAgLy8gcmVtb3ZlIG5pY2tuYW1lIGxpc3RlbmVyXG4gICAgc3VibWl0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnZXROaWNrbmFtZSwgdHJ1ZSk7XG4gICAgLy8gc3RhcnQgcXVpelxuICAgIG5ldyBRdWl6KCk7XG4gICAgLy9xLmdldFF1ZXN0aW9uKCk7XG59XG5cbi8qKlxuICogc2F2ZSBuaWNrbmFtZSBvZiBjdXJyZW50IHBsYXllciBpbiBzZXNzaW9uIHN0b3JhZ2VcbiAqIGFuZCBkaXNwbGF5IGl0IGluIHRoZSBoZWFkZXIgb2YgdGhlIHBhZ2UgZHVyaW5nIHRoZSBxdWl6XG4gKi9cbmZ1bmN0aW9uIGdldE5pY2tuYW1lKCkge1xuXG4gICAgdmFyIG5hbWUgPSBuaWNrbmFtZS52YWx1ZTtcblxuICAgIGlmIChuYW1lICE9PSBudWxsKSB7XG4gICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXCJuYW1lXCIsIG5hbWUpO1xuICAgICAgICB2YXIgZ3JlZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdyZWV0XCIpO1xuICAgICAgICB2YXIgc2F2ZWROYW1lID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShcIm5hbWVcIik7XG4gICAgICAgIGdyZWV0LnRleHRDb250ZW50ID0gXCJIYWxsbyBcIiArIHNhdmVkTmFtZSArIFwiIVwiO1xuICAgICAgICBuaWNrbmFtZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5pY2tuYW1lKTtcbiAgICAgICAgc3RhcnRRdWl6KCk7XG4gICAgfVxuXG59XG5cbi8vIGxpc3RlbiBmb3Igbmlja25hbWUgc3VibWlzc2lvblxuc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnZXROaWNrbmFtZSwgdHJ1ZSk7XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vL3ZhciBBamF4ID0gcmVxdWlyZShcIi4vc3JjL2FqYXhcIik7XG5cbi8vIHRlbXBsYXRlIGZvciB0aGUgZW5kIG9mIHRoZSBxdWl6XG52YXIgdGVtcEVuZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5kXCIpO1xudmFyIGVuZCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcEVuZC5jb250ZW50LCB0cnVlKTtcblxuLy8gZWxlbWVudCB0aGF0IHNob3dzIGN1cnJlbnQgcXVlc3Rpb25cbnZhciBxdWVzdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicXVlc3Rpb25cIik7XG4vLyBkaXYgd2l0aCBhbGwgdGhlIGFjdGlvblxudmFyIGJveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm94XCIpO1xuLy8gdGhlIGJ1dHRvblxudmFyIHN1Ym1pdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VibWl0XCIpO1xuLy8gZGl2IGZvciB1c2VyIGlucHV0XG52YXIgaW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlucHV0XCIpO1xuXG52YXIgdXJsID0gXCJodHRwOi8vdmhvc3QzLmxudS5zZToyMDA4MC9xdWVzdGlvbi8xXCI7XG52YXIgb3B0aW9ucyA9IGZhbHNlO1xudmFyIGFuc3dlcjtcbnZhciBpbnB1dEZpZWxkO1xuXG4vKipcbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gUXVpeigpIHtcbiAgICBib3gucXVlcnlTZWxlY3RvcihcImgzXCIpLmlubmVySFRNTCA9IFwiUXVlc3Rpb246XCI7XG4gICAgc3VibWl0LnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIFwiU3VibWl0IGFuc3dlclwiKTtcbiAgICBzdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMucG9zdEFuc3dlciwgdHJ1ZSk7XG4gICAgdGhpcy5nZXRRdWVzdGlvbigpO1xuICAgIGlucHV0LmZpcnN0Q2hpbGQucmVtb3ZlKCk7XG59XG5cblxuLyoqXG4gKiBBSkFYIEdFVCBSZXF1ZXN0XG4gKiByZXNwb25zZSBjb250YWlucyBxdWVzdGlvbiwgYW5zd2VyIGFsdGVybmF0aXZlcyAob3B0aW9uYWwpIGFuZCB0aGUgdXJsIHRvIHBvc3QgdGhlIGFuc3dlciB0b1xuICovXG5RdWl6LnByb3RvdHlwZS5nZXRRdWVzdGlvbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmIChyZXF1ZXN0LnJlYWR5U3RhdGUgPT09IDQgJiYgcmVxdWVzdC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgLy9tYW5hZ2Ugc2VydmVyIHJlc3BvbnNlXG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcblxuICAgICAgICAgICAgLy8/Pz8/PyBUT0RPXG4gICAgICAgICAgICBpZiAocmVzcG9uc2UubmV4dFVSTCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gcmVzcG9uc2UubmV4dFVSTDtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIllvdSB3b24hXCIpOyAgICAvL1RPRE8gZ2FtZW92ZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNxdWVzdGlvblwiKS50ZXh0Q29udGVudCA9IHJlc3BvbnNlLnF1ZXN0aW9uO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGF0dXNcIikudGV4dENvbnRlbnQgPSBcIlwiO1xuXG4gICAgICAgICAgICBRdWl6LnByb3RvdHlwZS5jbGVhcklucHV0Rm9ybSgpO1xuICAgICAgICAgICAgUXVpei5wcm90b3R5cGUuY3JlYXRlSW5wdXRGb3JtKHJlc3BvbnNlKTtcblxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGF0dXNcIikudGV4dENvbnRlbnQgPSBcIldhaXRpbmcuLi5cIjtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICByZXF1ZXN0LnNlbmQoKTtcblxuICAgIHF1ZXN0aW9uLnRleHRDb250ZW50ID0gXCJcIjtcblxufTtcblxuLyoqXG4gKiBBSkFYIFBPU1QgcmVxdWVzdFxuICogc2VuZHMgdXNlcidzIGFuc3dlclxuICogcmVzcG9uc2UgY29udGFpbnMgdXJsIGZvciBuZXh0IHF1ZXN0aW9uIGlmIHRoZSBhbnN3ZXIgaXMgY29ycmVjdFxuICovXG5RdWl6LnByb3RvdHlwZS5wb3N0QW5zd2VyID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gYW5zd2VyIGZvciBtdWx0aXBsZSBjaG9pY2UgcXVlc3Rpb25cbiAgICBpZihvcHRpb25zKSB7XG4gICAgICAgIFF1aXoucHJvdG90eXBlLmdldEFsdCgpO1xuICAgIH1cbiAgICAvLyBhbnN3ZXIgZm9yIHNpbXBsZSBxdWVzdGlvblxuICAgIGVsc2Uge1xuICAgICAgICBhbnN3ZXIgPSBpbnB1dEZpZWxkLnZhbHVlO1xuICAgIH1cblxuICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAocmVxdWVzdC5yZWFkeVN0YXRlID09PSA0ICkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG5cbiAgICAgICAgICAgIC8vIHRoZSBhbnN3ZXIgd2FzIHdyb25nIC0gdXNlciBsb3Nlc1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm1lc3NhZ2UgPT09IFwiV3JvbmcgYW5zd2VyISA6KFwiKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJZb3UgbG9zdFwiKTsgICAgIC8vVE9ETyBnYW1lb3ZlcigpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB0aGUgYW5zd2VyIHdhcyBjb3JyZWN0XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIHdhcyB0aGUgbGFzdCB0aGUgbGFzdCBxdWVzdGlvbiAtIHVzZXIgd2luc1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5uZXh0VVJMID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJZb3Ugd29uIVwiKTsgICAgLy9UT0RPIGdhbWVvdmVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgbmV4dCBxdWVzdGlvblxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1cmwgPSByZXNwb25zZS5uZXh0VVJMO1xuICAgICAgICAgICAgICAgICAgICBRdWl6LnByb3RvdHlwZS5nZXRRdWVzdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9wZW4oXCJQT1NUXCIsIHVybCwgdHJ1ZSk7XG4gICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICByZXF1ZXN0LnNlbmQoSlNPTi5zdHJpbmdpZnkoe1wiYW5zd2VyXCI6IGFuc3dlcn0pKTtcblxufTtcblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBpbnB1dCBmb3JtIGZvciB0aGUgYW5zd2VyOlxuICogaW5wdXQgZmllbGQgZm9yIHNpbXBsZSBxdWVzdGlvbnMgYW5kIHJhZGlvIGJ1dHRvbnMgZm9yIG11bHRpcGxlIGNob2ljZSBxdWVzdGlvbnNcbiAqIEBwYXJhbSByZXNwb25zZSBzZW50IGJ5IHNlcnZlciB0byBhcHAncyBHRVQgcmVxdWVzdFxuICovXG5RdWl6LnByb3RvdHlwZS5jcmVhdGVJbnB1dEZvcm0gPSBmdW5jdGlvbihyZXNwb25zZSkge1xuXG4gICAgLy8gZm9ybSB3aXRoIHJhZGlvIGJ1dHRvbnNcbiAgICBpZiAocmVzcG9uc2UuYWx0ZXJuYXRpdmVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgb3B0aW9ucyA9IHRydWU7XG4gICAgICAgIE9iamVjdC5rZXlzKHJlc3BvbnNlLmFsdGVybmF0aXZlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcblxuICAgICAgICAgICAgdmFyIGlucHV0UmFkaW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgICAgICBpbnB1dFJhZGlvLnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJyYWRpb1wiKTtcbiAgICAgICAgICAgIGlucHV0UmFkaW8uc2V0QXR0cmlidXRlKFwidmFsdWVcIiwga2V5KTtcbiAgICAgICAgICAgIGlucHV0UmFkaW8uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJrZXlcIik7XG4gICAgICAgICAgICBpbnB1dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKSk7XG4gICAgICAgICAgICBpbnB1dC5hcHBlbmRDaGlsZChpbnB1dFJhZGlvKTtcbiAgICAgICAgICAgIHZhciBhbHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShyZXNwb25zZS5hbHRlcm5hdGl2ZXNba2V5XSk7XG4gICAgICAgICAgICBpbnB1dC5hcHBlbmRDaGlsZChhbHQpO1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIikpO1xuICAgICAgICB9KTtcblxuICAgIH1cbiAgICAvLyBmb3JtIHdpdGggc2luZ2xlIGlucHV0IGZpZWxkXG4gICAgZWxzZSB7XG4gICAgICAgIG9wdGlvbnMgPSBmYWxzZTtcbiAgICAgICAgaW5wdXRGaWVsZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgaW5wdXRGaWVsZC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dFwiKTtcbiAgICAgICAgaW5wdXQuYXBwZW5kQ2hpbGQoaW5wdXRGaWVsZCk7XG4gICAgfVxufTtcblxuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGVsZW1lbnRzIGluIGlucHV0IGRpdlxuICogKHRleHQgaW5wdXQgZmllbGQgb3IgcmFkaW8gYnV0dG9ucylcbiAqL1xuUXVpei5wcm90b3R5cGUuY2xlYXJJbnB1dEZvcm0gPSBmdW5jdGlvbigpIHtcbiAgICB3aGlsZShpbnB1dC5maXJzdENoaWxkKSB7XG4gICAgICAgIGlucHV0LnJlbW92ZUNoaWxkKGlucHV0LmZpcnN0Q2hpbGQpO1xuICAgIH1cbn07XG5cbi8qKlxuICogZ2V0IHRoZSB1c2VyJ3MgYW5zd2VyIGZvciBtdWx0aXBsZSBjaG9pY2UgcXVlc3Rpb25cbiAqIChmaW5kIHRoZSByYWRpbyBidXR0b24gdGhhdCB3YXMgY2hlY2tlZClcbiAqL1xuUXVpei5wcm90b3R5cGUuZ2V0QWx0ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gZWFjaCByYWRpbyBidXR0b24gaGFzIGNsYXNzIGF0dHJpYnV0ZSBcImtleVwiXG4gICAgdmFyIGFsdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmtleVwiKTtcbiAgICB2YXIgaTtcbiAgICBmb3IoaSA9IDA7IGkgPCBhbHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhbHRzW2ldLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGFuc3dlciA9IGFsdHNbaV0udmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUXVpejtcbiJdfQ==
