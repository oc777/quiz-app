"use strict";

/**
 * NOT USED
 */

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


function storeWinner(name, time) {
    var winner = {"name": name, "time": time};
    var winners = [];

    if(localStorage.getItem("winners") !== null) {
        winners = JSON.parse(localStorage.getItem("winners"));
    }
    winners.push(winner);
    winners.sort(function(a,b){
        return a.time - b.time;
    });
    if (winners.length > 5) {
        winners.pop();
    }
    var json = JSON.stringify(winners);
    localStorage.setItem("winners", json);
}

function showWinners() {
    if(localStorage.getItem("winners") !== null) {
        var json = JSON.parse(localStorage.getItem("winners"))
        //var winners = json;
        for(var i = 0; i < json.length; i++) {
            var name = json[i].name;
            var time = json[i].time;
            console.log("Name: "+name+"; Time: "+time);
        }
    }
}


module.exports = {
    user: storeNickname,
    winners: storeWinners
};

