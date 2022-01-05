$(document).ready(function () {

    // Helper function to convert rating into stars
    $.fn.stars = function () {
        return $(this).each(function () {
            const rating = $(this).attr("rating");
            const fullStar = '<i class="fas fa-star"></i>'.repeat(Math.floor(rating));
            const halfStar = (rating % 1 !== 0) ? '<i class="fas fa-star-half-alt"></i>' : '';
            const noStar = '<i class="far fa-star"></i>'.repeat(Math.floor(5 - rating));
            $(this).html(fullStar + halfStar + noStar);
        });
    }

    $.ajax({
        url: "https://site202114.tw.cs.unibo.it/v1/products/",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        success: function (data) {
            var template = Handlebars.compile($("#product-card-template").html());
            $(".section").append(template(data));
            $(function () {
                $('.stars').stars();
            });
            $('.pageloader').removeClass('is-active');
        }
    });
    


    // Add new object modal  

    // Star rating on modal
    var starRatingStep = raterJs({
        starSize: 32,
        step: 0.5,
        element: document.querySelector("#rater"),
        rateCallback: function rateCallback(rating, done) {
            this.setRating(rating);
            done();
            $('button[type="submit"]').focus();
        }
    });

    // Activate modal
    $("#add-object").click(function () {
        $("#add-object-modal").addClass("is-active");
    });



    // function to reset the data on modal
    function resetModal() {
        $("#add-object-modal").removeClass("is-active");
        $("#add-object-form").trigger("reset");
        $("#images-upload").empty();
        $("#images-upload").parent().removeClass("is-success");
        starRatingStep.setRating(0);
    }

    // Close modal
    $("#add-object-modal-close, #add-object-modal-cancel, .modal-background").click(function () {
        resetModal();
    });

    // Image upload
    $("#images-upload-input").on('change', function () {
        let filename = $("<span></span >").addClass("file-name").text($(this).val().split("\\").pop());
        $("#images-upload").append(filename);
        $("#images-upload").parent().addClass("is-success");
    });


    // Convert from serialized form to JSON
    $('button[type="submit"]').click(function (e) {
        var inputData = $("#add-object-form").serializeArray();
        var formData = new FormData();
        for (var i = 0; i < inputData.length; i++) {
            formData.append([inputData[i]['name']], inputData[i]['value']);
        }
        formData.append('stars', Number(starRatingStep.getRating()).toFixed(1));
        // formData.append('images', ($("#images-upload-input")[0].files));
        for (var key of formData.keys()) {
            console.log(key);
            console.log(formData.get(key));
            console.log('---')
        }

        $.ajax({
            url: "https://site202114.tw.cs.unibo.it/v1/products/",
            type: "POST",
            data: formData,
            processData: false,
            //dataType: "jsonp",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authentication": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MTY3MDE2MTE3MWM5OTAwMTU5NTQ5NDMiLCJpYXQiOjE2Mzg5MDE1OTgsImV4cCI6MTYzODkwMzM5OCwidHlwZSI6ImFjY2VzcyJ9.VYgw2mBMjKEEmaR1ds8sCazgGr7q1CPKkXxpqcwjMsI"
            },
            success: function (data) {
                console.log(data);
                resetModal();
            }
        });
    });     
    
    $("#searchbar").on("keyup", function () {
        let value = $(this).val().toLowerCase();
        $(".card").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    })



    $("#plus-image").click(function (e) {
        e.preventDefault();
        $("#otherImagesList").append('<div class="control"><input id="object-otherImages" name="otherImages" class="input" type="text" placeholder=""></div>');
    });
});