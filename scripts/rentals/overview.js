Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

$(document).ready(function() {

    var past = [], present = [], future = [];

    function rentalsToRequests(rentals) {
        var reqs = [];
        for (const r of rentals) {

            if (r.approvedBy) {
                reqs.push(
                    $.ajax({
                        url: 'https://site202114.tw.cs.unibo.it/v1/users/' + r.approvedBy,
                        type: 'GET',
                        headers: {
                            "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
                        },
                        success: function (data) {
                            r.approvedBy = data.firstName + " " + data.lastName;
                        },
                        error: function (data) {
                            //alert("Error: " + data.responseText);
                        }
                    })
                );
            }

            reqs.push(
                $.ajax({
                    url: 'https://site202114.tw.cs.unibo.it/v1/users/' + r.userId,
                    type: 'GET',
                    headers: {
                        "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
                    },
                    success: function (data) {
                        r.userId = data.firstName + " " + data.lastName;
                    },
                    error: function (data) {
                        alert("Error: " + data.responseText);
                    }
                })        
            )

            reqs.push(
                $.ajax({
                    url: 'https://site202114.tw.cs.unibo.it/v1/products/' + Object.keys(r.products)[0],
                    type: 'GET',
                    headers: {
                        "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
                    },
                    success: function (data) {
                        r.product = data.name;
                    },
                    error: function (data) {
                        alert("Error: " + data.responseText);
                    }
                })
            )
        }
        return reqs;
    }

    $.ajax({
        url: 'https://site202114.tw.cs.unibo.it/v1/rentals',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
        },
        success: function(data) {

            for (r of data.results) {
                let [startDate, endDate] = findBoundaries(r);
                
                if (endDate < new Date()) {
                    past.push(r);
                } else if (startDate > new Date()) {
                    future.push(r);
                } else {
                    present.push(r);
                }
            }

            var requests = [];
            requests = requests.concat(rentalsToRequests(past));
            requests = requests.concat(rentalsToRequests(present));
            requests = requests.concat(rentalsToRequests(future));


            $.when.apply(undefined, requests).done(function() {

                // past = past.filter(function(r) {
                //     return r.userId != null && r.userId != "61cc37bbcf15a80014ebde07";
                // });

                // present = present.filter(function(r) {
                //     return r.userId != null && r.userId != "61cc37bbcf15a80014ebde07";
                // });

                // future = future.filter(function(r) {
                //     return r.userId != null && r.userId != "61cc37bbcf15a80014ebde07";
                // });

                let templatePast = Handlebars.compile($("#rentals-template").html());
                $("#past-rentals").append(templatePast(past));

                let templatePresent = Handlebars.compile($("#rentals-template").html());
                $("#present-rentals").append(templatePresent(present));

                let templateFuture = Handlebars.compile($("#rentals-template").html());
                $("#future-rentals").append(templateFuture(future));

                $(".pageloader").removeClass("is-active");

            }); 
        }
    })

    $(".tabs li a").click(function() {

        $(".tabs li").removeClass("is-active");
        $(this).parent().addClass("is-active");
        $(".tab").hide();

        var activeTab = $(this).attr("id");
        $("#" + activeTab + "-rentals").show();
    });


    $("#searchbar").on("keyup", function () {
        let value = $(this).val().toLowerCase();
        $(".card").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    })


});