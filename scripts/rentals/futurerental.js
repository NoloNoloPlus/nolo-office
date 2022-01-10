$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search);
    let id = searchParams.get('id');
    var rental, quote;

    $.ajax({
        url: "https://site202114.tw.cs.unibo.it/v1/rentals/" + id,
        type: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
        },
        success: function (data) {

            rental = JSON.parse(JSON.stringify(data));


            quote = data.products[Object.keys(data.products)[0]];

            augmentQuote(quote);

            console.log(rental);

            $("#id").append(id);
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


    // Edit rental
    $("#edit-rental").click(function () {
        let [startDate, endDate] = findBoundaries(rental);

        bulmaCalendar.attach('[type="date"]', {
            isRange: true,
            displayMode: "inline",
            showHeader: false,
            startDate: startDate,
            endDate: endDate
        });

        $("#editing").show();
    });

    // Ask for a quote
    $("#get-new-quote").click(function () {

        if (!($("#bulma-calendar")[0].bulmaCalendar.startDate) || !($("#bulma-calendar")[0].bulmaCalendar.endDate)) {
            $("#error").html("Please select a valid date range");
            return;
        }

        let data = {
            "from": new Date($("#bulma-calendar")[0].bulmaCalendar.startDate).toISOString().split('T')[0],
            "to": new Date($("#bulma-calendar")[0].bulmaCalendar.endDate).toISOString().split('T')[0],
        };

        $("#error").html("");

        $.ajax({
            url: "https://site202114.tw.cs.unibo.it/v1/products/" + Object.keys(rental.products)[0] + "/quote",
            type: "GET",
            data: data,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
            },
            success: function (response) {

                quote = JSON.parse(JSON.stringify(response));
                console.log(quote);

                augmentQuote(response);

                let template = Handlebars.compile($("#new-breakdown-template").html());
                $("#new-breakdown").html('<p class="title is-3">Quote breakdown</p>');
                $("#new-breakdown").append(template(response));
                $("#right-column").show();
            },
            error: function (data) {
                if (data.status == 500) {
                    $("#error").html("No available instances for this period");
                }
                else {
                    alert("Something went wrong: " + data.responseText);
                }
            }
        });
    });
    
    // Accept quote
    $(document).on('click', "#confirm-quote", function () {
        for (const [k, v] of Object.entries(quote.instances)) {
            delete v.currentStatus;
            delete v.logs;
            delete v.name;
        }

        rental.products[Object.keys(rental.products)[0]] = quote;
        delete rental.id;

        $.ajax({
            url: "https://site202114.tw.cs.unibo.it/v1/rentals/" + id,
            type: "PUT",
            headers: {
                "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
            },
            data: rental,
            success: function (data) {
                window.location.reload();
            },
            error: function (data) {
                alert("Something went wrong: " + data.responseText);
            }
        })
    });

    // Cancel editing
    $("#cancel-editing").click(function () {
        $("#editing").hide();
    });

    // Delete rental
    $("#delete-rental").click(function () {
        $.ajax({
            url: "https://site202114.tw.cs.unibo.it/v1/rentals/" + id,
            type: "DELETE",
            headers: {
                "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
            },
            success: function (data) {
                window.location.href = "overview.html";
            },
            error: function (data) {
                alert("Something went wrong: " + data.responseText);
            }
        });
    });
});