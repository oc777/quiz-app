(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//var store = require("./storage");
//store.user();

//store.winners();

var quiz = require("./quiz");
quiz.playQuiz();


},{"./quiz":2}],2:[function(require,module,exports){
function quiz() {

    //import the templates
    var tempAnswerN = document.getElementById("answerN");
    var tempAnswerR = document.getElementById("answerR");

    var answerN = document.importNode(tempAnswerN.content, true);
    var answerR = document.importNode(tempAnswerR.content, true);

    var answerNinput = answerN.querySelector("#answerInput");
    var answerRinput = answerR.querySelector("#answerMultiple");


    //set variables
    var nickname = document.getElementById("nicknameInput");
    var question = document.getElementById("question");
    var box = document.getElementById("box");

    var url = "http://vhost3.lnu.se:20080/question/1";
    var nextUrl = "";


    //step1: submit nickname and go to the first question

    var submit = document.getElementById("submit");

    //get the question

    //setTimeout(function() {...}, 0);
    submit.addEventListener("click", function() {
        //var obj = JSON.parse(request.responseText);

        //GET request
        var request = new XMLHttpRequest();

        request.onreadystatechange = function () {

            if (request.readyState === 4 && request.status === 200) {
                //manage server response
                var response = JSON.parse(request.responseText);

                if (response.nextURL !== undefined) {
                    nextUrl = response.nextURL;
                } else {
                    console.log("You won!");
                }

                if (response.question !== undefined) {                          //DO I NEED THIS IF????
                    document.querySelector("#question").textContent = response.question;
                    document.querySelector("#status").textContent = "";
                }

                if (response.alternatives !== undefined) {                      //HOW MANY TIMES????
                    if (answerNinput) {
                        box.replaceChild(answerRinput, answerNinput);
                    }

                } else {
                    if (answerRinput) {
                        box.replaceChild(answerNinput, answerRinput);
                    }

                }
            }
            else {
                document.querySelector("#status").textContent = "Waiting...";
            }

        };

        request.open("GET", url, true);
        request.send(null);

        question.textContent = "";

        //get and store nickname
        if (nickname) {
            var name = nickname.value;
            sessionStorage.setItem("name", name);
            var greet = document.getElementById("greet");
            var savedName = sessionStorage.getItem("name");
            greet.textContent = "Hey " + savedName + "!";
            //box.replaceChild(question, nickname);
            box.querySelector("h3").innerHTML = "Question:";
            box.replaceChild(answerNinput, nickname);
            submit.setAttribute("value", "Submit answer");
        }



    });



           /*
           submit1 = document.getElementById("answerInputSubmit");

           //if (submit !== null) {

           submit1.addEventListener("click", function() {
               var input = document.getElementById("answerInput");
               var answer = {};
               answer.answer = input;

               console.log(input);

               var request = new XMLHttpRequest();

               request.onreadystatechange = function() {

                   if (request.readyState === 4 && request.status === 200) {
                       var obj = JSON.parse(request.responseText);
                       document.querySelector(".question p").textContent = obj.message;
                   }
                   else {
                       document.querySelector(".question p").textContent = "Waiting...";
                   }

               };
               request.open("POST", nextUrl);
               request.setRequestHeader("Content-type", "application/json");
               request.send(JSON.stringify(answer));




           });
           //}




    });
    */


    //step2: post the answer


}



function ajaxPost(url, callback, data) {
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
}


function ajaxGet(url, callback) {
    try {
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                callback(request);
            }
        };
    } catch (error) {
        console.log("Whoops!");
    }
}


module.exports.playQuiz = quiz;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9xdWl6LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvL3ZhciBzdG9yZSA9IHJlcXVpcmUoXCIuL3N0b3JhZ2VcIik7XG4vL3N0b3JlLnVzZXIoKTtcblxuLy9zdG9yZS53aW5uZXJzKCk7XG5cbnZhciBxdWl6ID0gcmVxdWlyZShcIi4vcXVpelwiKTtcbnF1aXoucGxheVF1aXooKTtcblxuIiwiZnVuY3Rpb24gcXVpeigpIHtcblxuICAgIC8vaW1wb3J0IHRoZSB0ZW1wbGF0ZXNcbiAgICB2YXIgdGVtcEFuc3dlck4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFuc3dlck5cIik7XG4gICAgdmFyIHRlbXBBbnN3ZXJSID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhbnN3ZXJSXCIpO1xuXG4gICAgdmFyIGFuc3dlck4gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBBbnN3ZXJOLmNvbnRlbnQsIHRydWUpO1xuICAgIHZhciBhbnN3ZXJSID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wQW5zd2VyUi5jb250ZW50LCB0cnVlKTtcblxuICAgIHZhciBhbnN3ZXJOaW5wdXQgPSBhbnN3ZXJOLnF1ZXJ5U2VsZWN0b3IoXCIjYW5zd2VySW5wdXRcIik7XG4gICAgdmFyIGFuc3dlclJpbnB1dCA9IGFuc3dlclIucXVlcnlTZWxlY3RvcihcIiNhbnN3ZXJNdWx0aXBsZVwiKTtcblxuXG4gICAgLy9zZXQgdmFyaWFibGVzXG4gICAgdmFyIG5pY2tuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuaWNrbmFtZUlucHV0XCIpO1xuICAgIHZhciBxdWVzdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicXVlc3Rpb25cIik7XG4gICAgdmFyIGJveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm94XCIpO1xuXG4gICAgdmFyIHVybCA9IFwiaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMVwiO1xuICAgIHZhciBuZXh0VXJsID0gXCJcIjtcblxuXG4gICAgLy9zdGVwMTogc3VibWl0IG5pY2tuYW1lIGFuZCBnbyB0byB0aGUgZmlyc3QgcXVlc3Rpb25cblxuICAgIHZhciBzdWJtaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1Ym1pdFwiKTtcblxuICAgIC8vZ2V0IHRoZSBxdWVzdGlvblxuXG4gICAgLy9zZXRUaW1lb3V0KGZ1bmN0aW9uKCkgey4uLn0sIDApO1xuICAgIHN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vdmFyIG9iaiA9IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpO1xuXG4gICAgICAgIC8vR0VUIHJlcXVlc3RcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKHJlcXVlc3QucmVhZHlTdGF0ZSA9PT0gNCAmJiByZXF1ZXN0LnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgLy9tYW5hZ2Ugc2VydmVyIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubmV4dFVSTCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRVcmwgPSByZXNwb25zZS5uZXh0VVJMO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiWW91IHdvbiFcIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnF1ZXN0aW9uICE9PSB1bmRlZmluZWQpIHsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vRE8gSSBORUVEIFRISVMgSUY/Pz8/XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcXVlc3Rpb25cIikudGV4dENvbnRlbnQgPSByZXNwb25zZS5xdWVzdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGF0dXNcIikudGV4dENvbnRlbnQgPSBcIlwiO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5hbHRlcm5hdGl2ZXMgIT09IHVuZGVmaW5lZCkgeyAgICAgICAgICAgICAgICAgICAgICAvL0hPVyBNQU5ZIFRJTUVTPz8/P1xuICAgICAgICAgICAgICAgICAgICBpZiAoYW5zd2VyTmlucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBib3gucmVwbGFjZUNoaWxkKGFuc3dlclJpbnB1dCwgYW5zd2VyTmlucHV0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFuc3dlclJpbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYm94LnJlcGxhY2VDaGlsZChhbnN3ZXJOaW5wdXQsIGFuc3dlclJpbnB1dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhdHVzXCIpLnRleHRDb250ZW50ID0gXCJXYWl0aW5nLi4uXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICByZXF1ZXN0Lm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICAgICAgcmVxdWVzdC5zZW5kKG51bGwpO1xuXG4gICAgICAgIHF1ZXN0aW9uLnRleHRDb250ZW50ID0gXCJcIjtcblxuICAgICAgICAvL2dldCBhbmQgc3RvcmUgbmlja25hbWVcbiAgICAgICAgaWYgKG5pY2tuYW1lKSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IG5pY2tuYW1lLnZhbHVlO1xuICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShcIm5hbWVcIiwgbmFtZSk7XG4gICAgICAgICAgICB2YXIgZ3JlZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdyZWV0XCIpO1xuICAgICAgICAgICAgdmFyIHNhdmVkTmFtZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJuYW1lXCIpO1xuICAgICAgICAgICAgZ3JlZXQudGV4dENvbnRlbnQgPSBcIkhleSBcIiArIHNhdmVkTmFtZSArIFwiIVwiO1xuICAgICAgICAgICAgLy9ib3gucmVwbGFjZUNoaWxkKHF1ZXN0aW9uLCBuaWNrbmFtZSk7XG4gICAgICAgICAgICBib3gucXVlcnlTZWxlY3RvcihcImgzXCIpLmlubmVySFRNTCA9IFwiUXVlc3Rpb246XCI7XG4gICAgICAgICAgICBib3gucmVwbGFjZUNoaWxkKGFuc3dlck5pbnB1dCwgbmlja25hbWUpO1xuICAgICAgICAgICAgc3VibWl0LnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIFwiU3VibWl0IGFuc3dlclwiKTtcbiAgICAgICAgfVxuXG5cblxuICAgIH0pO1xuXG5cblxuICAgICAgICAgICAvKlxuICAgICAgICAgICBzdWJtaXQxID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhbnN3ZXJJbnB1dFN1Ym1pdFwiKTtcblxuICAgICAgICAgICAvL2lmIChzdWJtaXQgIT09IG51bGwpIHtcblxuICAgICAgICAgICBzdWJtaXQxLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgIHZhciBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYW5zd2VySW5wdXRcIik7XG4gICAgICAgICAgICAgICB2YXIgYW5zd2VyID0ge307XG4gICAgICAgICAgICAgICBhbnN3ZXIuYW5zd2VyID0gaW5wdXQ7XG5cbiAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGlucHV0KTtcblxuICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICAgICAgICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0LnJlYWR5U3RhdGUgPT09IDQgJiYgcmVxdWVzdC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2JqID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucXVlc3Rpb24gcFwiKS50ZXh0Q29udGVudCA9IG9iai5tZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5xdWVzdGlvbiBwXCIpLnRleHRDb250ZW50ID0gXCJXYWl0aW5nLi4uXCI7XG4gICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgcmVxdWVzdC5vcGVuKFwiUE9TVFwiLCBuZXh0VXJsKTtcbiAgICAgICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgICAgICAgICAgICByZXF1ZXN0LnNlbmQoSlNPTi5zdHJpbmdpZnkoYW5zd2VyKSk7XG5cblxuXG5cbiAgICAgICAgICAgfSk7XG4gICAgICAgICAgIC8vfVxuXG5cblxuXG4gICAgfSk7XG4gICAgKi9cblxuXG4gICAgLy9zdGVwMjogcG9zdCB0aGUgYW5zd2VyXG5cblxufVxuXG5cblxuZnVuY3Rpb24gYWpheFBvc3QodXJsLCBjYWxsYmFjaywgZGF0YSkge1xuICAgIHRyeSB7XG4gICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHJlcXVlc3Qub3BlbihcIlBPU1RcIiwgdXJsLCB0cnVlKTtcbiAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICAgICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAocmVxdWVzdC5yZWFkeVN0YXRlID09PSA0ICYmIHJlcXVlc3Quc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhyZXF1ZXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmVxdWVzdC5zZW5kKGRhdGEpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiV2hvb3BzIVwiKTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gYWpheEdldCh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgcmVxdWVzdC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHJlcXVlc3QucmVhZHlTdGF0ZSA9PT0gNCAmJiByZXF1ZXN0LnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2socmVxdWVzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJXaG9vcHMhXCIpO1xuICAgIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cy5wbGF5UXVpeiA9IHF1aXo7XG4iXX0=
