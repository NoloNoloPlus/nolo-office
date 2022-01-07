$(document).ready(function () {
    $.ajax({
        url: "https://site202114.tw.cs.unibo.it/v1/users/",
        type: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
        },
        data: {
            role: "user"
        },
        success: function (data) {
            console.log(data);
            var template = Handlebars.compile($("#client-row-template").html());
            $("table").html(template(data));
            $('.pageloader').removeClass('is-active');
        },
        error: function (data) {
            alert("Something went wrong: " + data.statusText);
        }
    });

    $("table").on('click', 'tr', function () {
        let id = $(this).find("#client-id").html();
        window.location.href = "client.html?id=" + id;
    });

    $("#searchbar").on("keyup", function() {
        let value = $(this).val().toLowerCase();
        $("tbody tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    })
});