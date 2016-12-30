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



//request.readyState === 4 && callback && callback(x.responseText, x);
//var myArr = JSON.parse(request.responseText);
