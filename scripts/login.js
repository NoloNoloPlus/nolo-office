$(document).ready(function () {

    function showError(error) {
        $("form input").addClass('is-danger');
        $("#error").html(error);
    }

    function clearError() {
        $("form input").removeClass('is-danger');
        $("#error").html("");
    }

    $("form input").click(function () {
        clearError();
    });

    $('button[type="submit"]').click(function (e) {
        e.preventDefault();
        var data = $(this).parents('form').serialize();
        $.ajax({
            url: 'https://site202114.tw.cs.unibo.it/v1/auth/login',
            type: 'POST',
            data: data,
            success: function (data) {
                if (data.user.role == "user") {
                    showError("You are not authorized to access this page");
                }
                else {
                    clearError();
                    console.log(data);
                    localStorage.setItem("tokens", JSON.stringify(data.tokens));
                    localStorage.setItem("user", JSON.stringify(data.user));
                    let redirect = localStorage.getItem("redirect");
                    localStorage.removeItem("redirect");
                    window.location.href = redirect || "index.html"; 
                }
            },
            error: function (response) {
                if(response.status == 401) {
                    showError("Invalid credentials");
                } else {
                    alert("Something went wrong: " + data.statusText);
                    setTimeout(() => { window.location.reload() }, 3000);
                }
            }
        });
    });
});