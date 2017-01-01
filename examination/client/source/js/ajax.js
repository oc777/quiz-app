"use strict";

/**
 *
 * NOT USED
 */
function Ajax() {}

Ajax.prototype.aPost = function(url, callback, data) {
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
};

Ajax.prototype.aGet = function(url, callback) {
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
};



module.exports = Ajax;
