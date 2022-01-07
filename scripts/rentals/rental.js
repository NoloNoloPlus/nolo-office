$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search);
    let id = searchParams.get('id');

    $.ajax({
        url: "https://site202114.tw.cs.unibo.it/v1/rentals/" + id,
        type: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
        },
        success: function (data) {
            console.log(data);
            var template = Handlebars.compile($("#rental-template").html());
            $("section").append(template(data));

            // var templateInstances = Handlebars.compile($("#rental-instance-template").html());
            // $("#rental-instances").append(templateInstances(data));

            $.when(
                $.ajax({
                    url: "https://site202114.tw.cs.unibo.it/v1/users/" + data["userId"],
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
                    },
                    success: function (resp) {
                        console.log(resp);
                        $("#rentedBy").append(resp.firstName + " " + resp.lastName);
                    }
                }),
                $.get("https://site202114.tw.cs.unibo.it/v1/products/" + Object.keys(data.products)[0], function (resp) {
                    console.log(resp);
                    $("#productName").html(resp.name);
                })
            ).then(function () {
                $(".pageloader").removeClass('is-active');
            });
            // $.get("https://site202114.tw.cs.unibo.it/v1/clients/" + data.userId, function (resp) {
            //     console.log(resp);
            //     $("#rentedBy").html(resp.firstName + " " + resp.lastName);
            // })
            

        },
        error: function (data) {
            alert("Something went wrong: " + data.statusText);
        }
    });

    function restoreState() {
        $("#update-client-pending").hide();
        $("#cancel-update").hide();
        $("#update-client").show();
        $("input[readonly]").attr('readonly', 'readonly');
    }

    $("#update-client").click(function () {
        $(this).hide();
        $("#update-client-pending").show();
        $("#cancel-update").show();
        $("input[readonly]").removeAttr('readonly');

        let saved_data = {};
        $('input').each(function () {
            saved_data[$(this).attr('name')] = $(this).val();
            console.log($(this).val());
        });

        $("#cancel-update").click(function () {
            $('input').each(function () {
                $(this).val(saved_data[$(this).attr('name')]);
            });
            restoreState();
        });

        $("#update-client-pending").click(function () {
            $(this).addClass('is-loading');

            let data = {};
            $('input').each(function () {
                if ($(this).attr('name') == 'name' || $(this).attr('name') == 'email') {
                    data[$(this).attr('name')] = $(this).val();
                }
            });

            $.ajax({
                url: "https://site202114.tw.cs.unibo.it/v1/rentals/" + id,
                type: "PATCH",
                data: data,
                headers: {
                    "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
                },
                async: false,
                success: function (data) {
                    $(this).removeClass('is-loading');
                    restoreState();
                },
                error: function (data) {
                    $(this).removeClass('is-loading');
                    console.log(data);
                    alert(`Something went wrong: ${data.statusText} 
                    Unable to update client information`);
                }
            });
        });
    });

    $("delete-client").click(function () {
        // TODO: check if this works
        // $(this).addClass('is-loading');

        // $.ajax({
        //     url: "https://site202114.tw.cs.unibo.it/v1/users/" + id,
        //     type: "DELETE",
        //     headers: {
        //         "Accept": "application/json",
        //         "Content-Type": "application/json",
        //         "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
        //     },
        //     async: false,
        //     success: function (data) {
        //         $(this).removeClass('is-loading');
        //         restoreState();
        // CAMBIA URL
        //     },
        //     error: function (data) {
        //         $(this).removeClass('is-loading');
        //         console.log(data);
        //         alert(`Something went wrong: ${data.statusText} 
        //         Unable to delete client`);
        //     }
        // });
    });
});