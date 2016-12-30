var url = "#";

var targetEvent = document.getElementById("submit");
var targetPost = document.getElementById("question");

targetEvent.addEventListener("click", load);
    //load(url, myFunction));

function load(url, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            callback(request);
        }
    };

    request.open("GET", url, true);
    request.send();
}

function myFunction(request, targetPost) {
    document.querySelector(targetPost).textContent = request.responseText;
}



