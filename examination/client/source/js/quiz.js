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
