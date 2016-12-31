"use strict";

function storeNickname() {

    var submit = document.getElementById("nicknameSubmit");

    submit.addEventListener("click", function() {
        var name = document.getElementById("nicknameInput").value;
        sessionStorage.setItem("name", name);

        var status = document.getElementById("status");

        var savedName = sessionStorage.getItem("name");

        status.textContent = "Hey " + savedName + "!";


    });


}


function storeWinners() {
    localStorage.setItem("winner1name", "name");
    localStorage.setItem("winner1time", "time");

    localStorage.setItem("winner2name", "name");
    localStorage.setItem("winner2time", "time");

    localStorage.setItem("winner3name", "name");
    localStorage.setItem("winner3time", "time");

    localStorage.setItem("winner4name", "name");
    localStorage.setItem("winner4time", "time");

    localStorage.setItem("winner5name", "name");
    localStorage.setItem("winner5time", "time");

}


module.exports = {
    user: storeNickname,
    winners: storeWinners
};

/*
var winner = {
    name: name,
    score: score
}

localStorage.winner = JSON.stringify(winner);

var winnerObj = JSON.parse(localStorage.winner);

console.log(winnerObj.name + " won in " + winnerObj.score);
 */
