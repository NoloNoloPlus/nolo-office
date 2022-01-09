$(document).ready(function () {
    $("#logged-as").html(JSON.parse(localStorage.getItem("user"))["firstName"] + " " + JSON.parse(localStorage.getItem("user"))["lastName"]);

});