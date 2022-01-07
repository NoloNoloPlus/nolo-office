$(document).ready(function() {

    var past = [], present = [], future = [];

    $.ajax({
        url: 'https://site202114.tw.cs.unibo.it/v1/rentals',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
        },
        success: function(data) {
            console.log(data);
            $(".pageloader").removeClass("is-active");


            for(r of data.results) {
                

                let [startDate, endDate] = findBoundaries(r);
                
                if (endDate < new Date()) {
                    past.push(r);
                } else if (startDate > new Date()) {
                    future.push(r);
                } else {
                    present.push(r);
                }
            }
            console.log(past);
            let templatePast = Handlebars.compile($("#rentals-template").html());
            $("#past-rentals").append(templatePast(past));

            let templatePresent = Handlebars.compile($("#rentals-template").html());
            $("#present-rentals").append(templatePresent(present));

            let templateFuture = Handlebars.compile($("#rentals-template").html());
            $("#future-rentals").append(templateFuture(future));
        }
    })

    $(".tabs li a").click(function() {

        $(".tabs li").removeClass("is-active");
        $(this).parent().addClass("is-active");
        $(".tab").hide();

        var activeTab = $(this).attr("id");
        $("#" + activeTab + "-rentals").show();
    });

    Handlebars.registerHelper('filter', function (list, k, v, opts) {
        console.log(Object.keys(list[0].products));
        var i, result = '';
        for (i = 0; i < list.length; ++i)
            if (list[i][k] == v)
                result = result + opts.fn(list[i]);
        return result;
    });

    $("#searchbar").on("keyup", function () {
        let value = $(this).val().toLowerCase();
        $(".card").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    })


});