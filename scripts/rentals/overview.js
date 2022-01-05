$(document).ready(function() {

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
        }
    })

    $(".tabs li a").click(function() {
        $(".tabs li").removeClass("is-active");
        $(this).parent().addClass("is-active");
        $(".tab").hide();
        var activeTab = $(this).attr("id");
        $("#" + activeTab + "-rentals").show();
    });


});