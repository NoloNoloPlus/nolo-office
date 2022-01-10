$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search);
    let id = searchParams.get('id');
    var rental;

    $.ajax({
        url: "https://site202114.tw.cs.unibo.it/v1/rentals/" + id,
        type: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
        },
        success: function (data) {

            let [startDate, endDate] = findBoundaries(data);
            if (startDate > new Date()) {
                window.location.href = "futurerental.html?id=" + id;
            }

            rental = JSON.parse(JSON.stringify(data));


            quote = data.products[Object.keys(data.products)[0]];

            augmentQuote(quote);

            console.log(data);
            var template = Handlebars.compile($("#rental-template").html());
            $("section").append(template(data));
            $(".tag:contains('" + data.status + "')").addClass("is-primary");

            var templateBreakdown = Handlebars.compile($("#breakdown-template").html());
            $("#breakdown").append(templateBreakdown(quote));


            $.when(
                $.ajax({
                    url: "https://site202114.tw.cs.unibo.it/v1/users/" + data.userId,
                    type: "GET",
                    headers: {
                        "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
                    },
                    success: function (resp) {
                        $("#rentedBy").append(resp.firstName + " " + resp.lastName);
                        $("#user-image").attr("src", resp.avatarUrl || "http://www.gravatar.com/avatar/ee194f150caf4ef175b36caaeb2f7782.jpg?s=48&d=mm");
                    }
                }),
                $.get("https://site202114.tw.cs.unibo.it/v1/products/" + Object.keys(data.products)[0], function (resp) {
                    console.log("AAA", resp);
                    for (const [k, v] of Object.entries(resp.instances)) {
                        $("#instance-" + k + "-name").html(v.name);
                    }
                    $("#productName").html(resp.name);
                    $("#product-image").attr("src", resp.coverImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx7ub_01iKN_RXyma9iHPES-bIrZGwbQniuw&usqp=CAU");
                }),
                $.ajax({
                    url: "https://site202114.tw.cs.unibo.it/v1/users/" + data.approvedBy,
                    type: "GET",
                    headers: {
                        "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
                    },
                    success: function (resp2) {
                        $("#employeeName").append(resp2.firstName + " " + resp2.lastName);
                    }
                })
            ).then(function () {
                $(".pageloader").removeClass('is-active');
            });
        },
        error: function (data) {
            alert("Something went wrong: " + data.statusText);
        }
    });

    $(document).on("click", ".tag", function () {
        $(".tag").removeClass("is-primary");
        $(this).addClass("is-primary");

        delete rental.id;
        delete rental.closed;

        rental.status = $(this).text();
        $.ajax({
            url: "https://site202114.tw.cs.unibo.it/v1/rentals/" + id,
            type: "PUT",
            headers: {
                "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
            },
            data: rental,
            success: function (data) {
                console.log(data);
            },
            error: function (data) {
                alert("Something went wrong: " + data.responseText);
            }
        });
    });
});