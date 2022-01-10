$(document).ready(function () {

    $.ajax({
        url: "https://site202114.tw.cs.unibo.it/v1/products/",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        success: function (data) {
            var template = Handlebars.compile($("#product-card-template").html());
            $(".section").append(template(data));
            $('.pageloader').removeClass('is-active');
        }
    });
    


    // Add new object modal  

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

        var data = {
            otherImages: []
        };
        $.each(inputData, function () {
            if (this.name == 'otherImages') {
                if (this.value != "") {
                    data[this.name].push(this.value);
                }
            } else {
                data[this.name] = this.value;
            }
        });
        
        if (data.name == "" || data.coverImage == "" || data.description == "" || data.price == "" || data.category == "" || data.quantity == "") {
            alert("Fields Name, Description Cover Image are required");
            e.preventDefault();
            return;
        } else {
            $.ajax({
                url: "https://site202114.tw.cs.unibo.it/v1/products/",
                type: "POST",
                data: data,
                headers: {
                    "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
                },
                success: function (data) {
                    resetModal();
                    window.location.reload();
                },
                error: function (data) {
                    alert("Error: " + data.responseText);
                }
            });
        }  
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


    function isLoggedIn() {
        var tokens = JSON.parse(localStorage.getItem("tokens"));
        if (tokens == null) return false;
        if (Date.parse(tokens.access.expires) < Date.now()) {
            if (Date.parse(tokens.refresh.expires) < Date.now())
                return false;

            var result;
            $.ajax({
                url: 'https://site202114.tw.cs.unibo.it/v1/auth/refreshTokens',
                type: 'POST',
                data: {
                    refreshToken: tokens.refresh.token
                },
                async: false,
                success: function (data) {
                    localStorage.setItem('tokens', JSON.stringify(data.tokens));
                    result = true;
                },
                error: function (response) {
                    result = false;
                }
            });
            return result;

        } else return true;
    }

    // Logout check
    if (!(isLoggedIn())) {
        $("#logout-button").hide();
        $("#add-object").hide();
    }

    // Logout
    $("#logout-button").click(function () {
        localStorage.removeItem("tokens");
        window.location.href = window.location.href.replace(new RegExp("/pages/.*"), "/pages/login.html");
    });
});
