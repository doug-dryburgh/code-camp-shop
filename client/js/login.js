$(document).ready(function () {

    $("#loginLink").click(function () {
        $("#login").css("display", "flex");
        $("#register").css("display", "none");

    });

    $("#regLink").click(function () {
        $("#login").css("display", "none");
        $("#register").css("display", "flex");
    });

});
