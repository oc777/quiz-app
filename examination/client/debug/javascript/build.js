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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9xdWl6LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgUXVpeiA9IHJlcXVpcmUoXCIuL3F1aXpcIik7XG5cbnZhciBuaWNrbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmlja25hbWVJbnB1dFwiKTtcbnZhciBzdWJtaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1Ym1pdFwiKTtcblxuLyoqXG4gKiBnZXQgdGhlIGZpcnN0IHF1ZXN0aW9uIG9mIHRoZSBxdWl6XG4gKi9cbmZ1bmN0aW9uIHN0YXJ0UXVpeigpIHtcbiAgICAvLyByZW1vdmUgbmlja25hbWUgbGlzdGVuZXJcbiAgICBzdWJtaXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdldE5pY2tuYW1lLCB0cnVlKTtcbiAgICAvLyBzdGFydCBxdWl6XG4gICAgbmV3IFF1aXooKTtcbiAgICAvL3EuZ2V0UXVlc3Rpb24oKTtcbn1cblxuLyoqXG4gKiBzYXZlIG5pY2tuYW1lIG9mIGN1cnJlbnQgcGxheWVyIGluIHNlc3Npb24gc3RvcmFnZVxuICogYW5kIGRpc3BsYXkgaXQgaW4gdGhlIGhlYWRlciBvZiB0aGUgcGFnZSBkdXJpbmcgdGhlIHF1aXpcbiAqL1xuZnVuY3Rpb24gZ2V0Tmlja25hbWUoKSB7XG5cbiAgICB2YXIgbmFtZSA9IG5pY2tuYW1lLnZhbHVlO1xuXG4gICAgaWYgKG5hbWUgIT09IG51bGwpIHtcbiAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShcIm5hbWVcIiwgbmFtZSk7XG4gICAgICAgIHZhciBncmVldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ3JlZXRcIik7XG4gICAgICAgIHZhciBzYXZlZE5hbWUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwibmFtZVwiKTtcbiAgICAgICAgZ3JlZXQudGV4dENvbnRlbnQgPSBcIkhhbGxvIFwiICsgc2F2ZWROYW1lICsgXCIhXCI7XG4gICAgICAgIG5pY2tuYW1lLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobmlja25hbWUpO1xuICAgICAgICBzdGFydFF1aXooKTtcbiAgICB9XG5cbn1cblxuLy8gbGlzdGVuIGZvciBuaWNrbmFtZSBzdWJtaXNzaW9uXG5zdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdldE5pY2tuYW1lLCB0cnVlKTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vdmFyIEFqYXggPSByZXF1aXJlKFwiLi9zcmMvYWpheFwiKTtcblxuLy8gdGVtcGxhdGUgZm9yIHRoZSBlbmQgb2YgdGhlIHF1aXpcbnZhciB0ZW1wRW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRcIik7XG52YXIgZW5kID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wRW5kLmNvbnRlbnQsIHRydWUpO1xuXG5cblxuXG4vLyBlbGVtZW50IHRoYXQgc2hvd3MgY3VycmVudCBxdWVzdGlvblxudmFyIHF1ZXN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJxdWVzdGlvblwiKTtcbi8vIGRpdiB3aXRoIGFsbCB0aGUgYWN0aW9uXG52YXIgYm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib3hcIik7XG4vLyB0aGUgYnV0dG9uXG52YXIgc3VibWl0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdWJtaXRcIik7XG4vLyBkaXYgZm9yIHVzZXIgaW5wdXRcbnZhciBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW5wdXRcIik7XG5cblxudmFyIHVybCA9IFwiaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMVwiO1xudmFyIG9wdGlvbnMgPSBmYWxzZTtcbnZhciBhbnN3ZXI7XG52YXIgaW5wdXRGaWVsZDtcblxuLyoqXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFF1aXooKSB7XG4gICAgYm94LnF1ZXJ5U2VsZWN0b3IoXCJoM1wiKS5pbm5lckhUTUwgPSBcIlF1ZXN0aW9uOlwiO1xuICAgIHN1Ym1pdC5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBcIlN1Ym1pdCBhbnN3ZXJcIik7XG4gICAgc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnBvc3RBbnN3ZXIsIHRydWUpO1xuICAgIHRoaXMuZ2V0UXVlc3Rpb24oKTtcbiAgICBpbnB1dC5maXJzdENoaWxkLnJlbW92ZSgpO1xufVxuXG5cbi8qKlxuICogQUpBWCBHRVQgUmVxdWVzdFxuICogcmVzcG9uc2UgY29udGFpbnMgcXVlc3Rpb24sIGFuc3dlciBhbHRlcm5hdGl2ZXMgKG9wdGlvbmFsKSBhbmQgdGhlIHVybCB0byBwb3N0IHRoZSBhbnN3ZXIgdG9cbiAqL1xuUXVpei5wcm90b3R5cGUuZ2V0UXVlc3Rpb24gPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBpZiAocmVxdWVzdC5yZWFkeVN0YXRlID09PSA0ICYmIHJlcXVlc3Quc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIC8vbWFuYWdlIHNlcnZlciByZXNwb25zZVxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG5cbiAgICAgICAgICAgIHVybCA9IHJlc3BvbnNlLm5leHRVUkw7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAvLz8/Pz8/IFRPRE9cbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5uZXh0VVJMICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSByZXNwb25zZS5uZXh0VVJMO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiWW91IHdvbiFcIik7ICAgIC8vVE9ETyBnYW1lb3ZlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNxdWVzdGlvblwiKS50ZXh0Q29udGVudCA9IHJlc3BvbnNlLnF1ZXN0aW9uO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGF0dXNcIikudGV4dENvbnRlbnQgPSBcIlwiO1xuXG4gICAgICAgICAgICBRdWl6LnByb3RvdHlwZS5jbGVhcklFbGVtZW50KGlucHV0KTtcbiAgICAgICAgICAgIFF1aXoucHJvdG90eXBlLmNyZWF0ZUlucHV0Rm9ybShyZXNwb25zZSk7XG5cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhdHVzXCIpLnRleHRDb250ZW50ID0gXCJXYWl0aW5nLi4uXCI7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgcmVxdWVzdC5zZW5kKCk7XG5cbiAgICBxdWVzdGlvbi50ZXh0Q29udGVudCA9IFwiXCI7XG5cbn07XG5cbi8qKlxuICogQUpBWCBQT1NUIHJlcXVlc3RcbiAqIHNlbmRzIHVzZXIncyBhbnN3ZXJcbiAqIHJlc3BvbnNlIGNvbnRhaW5zIHVybCBmb3IgbmV4dCBxdWVzdGlvbiBpZiB0aGUgYW5zd2VyIGlzIGNvcnJlY3RcbiAqL1xuUXVpei5wcm90b3R5cGUucG9zdEFuc3dlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIC8vIGFuc3dlciBmb3IgbXVsdGlwbGUgY2hvaWNlIHF1ZXN0aW9uXG4gICAgaWYob3B0aW9ucykge1xuICAgICAgICBRdWl6LnByb3RvdHlwZS5nZXRBbHQoKTtcbiAgICB9XG4gICAgLy8gYW5zd2VyIGZvciBzaW1wbGUgcXVlc3Rpb25cbiAgICBlbHNlIHtcbiAgICAgICAgYW5zd2VyID0gaW5wdXRGaWVsZC52YWx1ZTtcbiAgICB9XG5cbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHJlcXVlc3QucmVhZHlTdGF0ZSA9PT0gNCApIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpO1xuXG4gICAgICAgICAgICAvLyB0aGUgYW5zd2VyIHdhcyB3cm9uZyAtIHVzZXIgbG9zZXNcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5tZXNzYWdlID09PSBcIldyb25nIGFuc3dlciEgOihcIikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiWW91IGxvc3RcIik7ICAgICAvL1RPRE8gZ2FtZW92ZXIoKVxuICAgICAgICAgICAgICAgIFF1aXoucHJvdG90eXBlLmZpbmlzaChmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB0aGUgYW5zd2VyIHdhcyBjb3JyZWN0XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIHdhcyB0aGUgbGFzdCB0aGUgbGFzdCBxdWVzdGlvbiAtIHVzZXIgd2luc1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5uZXh0VVJMID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJZb3Ugd29uIVwiKTsgICAgLy9UT0RPIGdhbWVvdmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIFF1aXoucHJvdG90eXBlLmZpbmlzaCh0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBuZXh0IHF1ZXN0aW9uXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVybCA9IHJlc3BvbnNlLm5leHRVUkw7XG4gICAgICAgICAgICAgICAgICAgIFF1aXoucHJvdG90eXBlLmdldFF1ZXN0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlcXVlc3Qub3BlbihcIlBPU1RcIiwgdXJsLCB0cnVlKTtcbiAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgIHJlcXVlc3Quc2VuZChKU09OLnN0cmluZ2lmeSh7XCJhbnN3ZXJcIjogYW5zd2VyfSkpO1xuXG59O1xuXG4vKipcbiAqIENyZWF0ZXMgdGhlIGlucHV0IGZvcm0gZm9yIHRoZSBhbnN3ZXI6XG4gKiBpbnB1dCBmaWVsZCBmb3Igc2ltcGxlIHF1ZXN0aW9ucyBhbmQgcmFkaW8gYnV0dG9ucyBmb3IgbXVsdGlwbGUgY2hvaWNlIHF1ZXN0aW9uc1xuICogQHBhcmFtIHJlc3BvbnNlIHNlbnQgYnkgc2VydmVyIHRvIGFwcCdzIEdFVCByZXF1ZXN0XG4gKi9cblF1aXoucHJvdG90eXBlLmNyZWF0ZUlucHV0Rm9ybSA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cbiAgICAvLyBmb3JtIHdpdGggcmFkaW8gYnV0dG9uc1xuICAgIGlmIChyZXNwb25zZS5hbHRlcm5hdGl2ZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvcHRpb25zID0gdHJ1ZTtcbiAgICAgICAgT2JqZWN0LmtleXMocmVzcG9uc2UuYWx0ZXJuYXRpdmVzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuXG4gICAgICAgICAgICB2YXIgaW5wdXRSYWRpbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgICAgIGlucHV0UmFkaW8uc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcInJhZGlvXCIpO1xuICAgICAgICAgICAgaW5wdXRSYWRpby5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBrZXkpO1xuICAgICAgICAgICAgaW5wdXRSYWRpby5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcImtleVwiKTtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpKTtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZENoaWxkKGlucHV0UmFkaW8pO1xuICAgICAgICAgICAgdmFyIGFsdCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHJlc3BvbnNlLmFsdGVybmF0aXZlc1trZXldKTtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZENoaWxkKGFsdCk7XG4gICAgICAgICAgICBpbnB1dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKSk7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuICAgIC8vIGZvcm0gd2l0aCBzaW5nbGUgaW5wdXQgZmllbGRcbiAgICBlbHNlIHtcbiAgICAgICAgb3B0aW9ucyA9IGZhbHNlO1xuICAgICAgICBpbnB1dEZpZWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICBpbnB1dEZpZWxkLnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJ0ZXh0XCIpO1xuICAgICAgICBpbnB1dC5hcHBlbmRDaGlsZChpbnB1dEZpZWxkKTtcbiAgICB9XG59O1xuXG5cbi8qKlxuICogUmVtb3ZlcyBhbGwgZWxlbWVudHMgaW5zaWRlIGFub3RoZXIgRE9NIGVsZW1lbnRcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIE5vZGUgdG8gYmUgY2xlYXJlZFxuICovXG5RdWl6LnByb3RvdHlwZS5jbGVhcklFbGVtZW50ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHdoaWxlKGVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBnZXQgdGhlIHVzZXIncyBhbnN3ZXIgZm9yIG11bHRpcGxlIGNob2ljZSBxdWVzdGlvblxuICogKGZpbmQgdGhlIHJhZGlvIGJ1dHRvbiB0aGF0IHdhcyBjaGVja2VkKVxuICovXG5RdWl6LnByb3RvdHlwZS5nZXRBbHQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBlYWNoIHJhZGlvIGJ1dHRvbiBoYXMgY2xhc3MgYXR0cmlidXRlIFwia2V5XCJcbiAgICB2YXIgYWx0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIua2V5XCIpO1xuICAgIHZhciBpO1xuICAgIGZvcihpID0gMDsgaSA8IGFsdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFsdHNbaV0uY2hlY2tlZCkge1xuICAgICAgICAgICAgYW5zd2VyID0gYWx0c1tpXS52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblxuXG5RdWl6LnByb3RvdHlwZS5maW5pc2ggPSBmdW5jdGlvbih3aW5uZXIpIHtcbiAgICBRdWl6LnByb3RvdHlwZS5jbGVhcklFbGVtZW50KGJveCk7XG4gICAgYm94LmFwcGVuZENoaWxkKGVuZCk7XG5cbiAgICB2YXIgcXVpelN0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicXVpelN0YXR1c1wiKTtcbiAgICB2YXIgcXVpelNjb3JlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJxdWl6U2NvcmVcIik7XG4gICAgdmFyIGJlc3RTY29yZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJlc3RTY29yZXNcIik7XG5cbiAgICAvL3Nob3cgc3RhdHVzOiB3aW4gb3IgbG9vc2VcbiAgICBpZih3aW5uZXIpIHtcbiAgICAgICAgcXVpelN0YXR1cy50ZXh0Q29udGVudCA9IFwiWW91IHdpbiEhIVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1aXpTdGF0dXMudGV4dENvbnRlbnQgPSBcIllvdSBsb29zZSA6KFwiO1xuICAgIH1cblxuICAgIC8vc2hvdyB0b3RhbCB0aW1lIFRPRE9cbiAgICBxdWl6U2NvcmUudGV4dENvbnRlbnQgPSBcInRpbWUgd2lsbCBiZSBoZXJlXCI7XG5cbiAgICAvL3Nob3cgZml2ZSBiZXN0XG4gICAgLy9UT0RPXG5cbiAgICAvL2dldCB0aGUgcGFnZSBsYXlvdXRcblxuXG5cblxufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFF1aXo7XG4iXX0=
