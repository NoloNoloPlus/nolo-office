// $(document).ready(function () {
//     let searchParams = new URLSearchParams(window.location.search);
//     let id = searchParams.get('id');
//     $("#client-id").append(id);

//     $.ajax({
//         url: "https://site202114.tw.cs.unibo.it/v1/users/" + id,
//         type: "GET",
//         headers: {
//             "Accept": "application/json",
//             "Content-Type": "application/json",
//             "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
//         },
//         success: function (data) {
//             console.log(data);
//             $('input').each(function () {
//                 let field = $(this).attr('name');
//                 if (!(field in Object.keys(data))) {
//                     $(this).val(data["address"][field]);
//                 }
//                 else {
//                     $(this).val(data[field]);
//                 }
//             });
//             $('.pageloader').removeClass('is-active');
//         },
//         error: function (data) {
//             alert("Something went wrong: " + data.statusText);
//         }
//     });

//     function restoreState() {
//         $("#update-client-pending").hide();
//         $("#cancel-update").hide();
//         $("#update-client").show();
//         $("input[readonly]").attr('readonly', 'readonly');
//     }

//     $("#update-client").click(function () {
//         $(this).hide();
//         $("#update-client-pending").show();
//         $("#cancel-update").show();
//         $("input[readonly]").removeAttr('readonly');

//         let saved_data = {};
//         $('input').each(function () {
//             saved_data[$(this).attr('name')] = $(this).val();
//             console.log($(this).val());
//         });

//         $("#cancel-update").click(function () {
//             $('input').each(function () {
//                 $(this).val(saved_data[$(this).attr('name')]);
//             });
//             restoreState();
//         });

//         $("#update-client-pending").click(function () {
//             $(this).addClass('is-loading');

//             let data = {};
//             $('input').each(function () {
//                 if ($(this).attr('name') == 'name' || $(this).attr('name') == 'email') {
//                     data[$(this).attr('name')] = $(this).val();
//                 }
//             });

//             $.ajax({
//                 url: "https://site202114.tw.cs.unibo.it/v1/users/" + id,
//                 type: "PATCH",
//                 data: data,
//                 headers: {
//                     "Accept": "application/json",
//                     "Content-Type": "application/json",
//                     "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
//                 },
//                 async: false,
//                 success: function (data) {
//                     $(this).removeClass('is-loading');
//                     restoreState();
//                 },
//                 error: function (data) {
//                     $(this).removeClass('is-loading');
//                     console.log(data);
//                     alert(`Something went wrong: ${data.statusText} 
//                     Unable to update client information`);
//                 }
//             });
//         });

//         $("delete-client").click(function () {
//             // TODO: check if this works
//             // $(this).addClass('is-loading');

//             // $.ajax({
//             //     url: "https://site202114.tw.cs.unibo.it/v1/users/" + id,
//             //     type: "DELETE",
//             //     headers: {
//             //         "Accept": "application/json",
//             //         "Content-Type": "application/json",
//             //         "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
//             //     },
//             //     async: false,
//             //     success: function (data) {
//             //         $(this).removeClass('is-loading');
//             //         restoreState();
//             // CAMBIA URL
//             //     },
//             //     error: function (data) {
//             //         $(this).removeClass('is-loading');
//             //         console.log(data);
//             //         alert(`Something went wrong: ${data.statusText} 
//             //         Unable to delete client`);
//             //     }
//             // });
//         });
//     });
// });


Handlebars.registerHelper("offset", function (value, options) {
    return parseInt(value) + 2;
});

$(document).ready(function () {

    $('input[name="daterange"]').daterangepicker({
        opens: 'left'
    }, function (start, end, label) {
        console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
    });

    let searchParams = new URLSearchParams(window.location.search);
    let id = searchParams.get('id');
    var calendars;

    $.ajax({
        url: "https://site202114.tw.cs.unibo.it/v1/products/" + id,
        type: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
        },
        success: function (data) {

            console.log(data);
            let templateCarousel = Handlebars.compile($("#carousel-images").html());
            $("#carousel").append(templateCarousel(data));

            bulmaCarousel.attach('#carousel', {
                slidesToScroll: 1,
                slidesToShow: 1,
                loop: true,
                pagination: false
            });

            let templateInfo = Handlebars.compile($("#product-info-template").html());
            $("#product-info").prepend(templateInfo(data));
            calendars = bulmaCalendar.attach('[type="date"]', {
                isRange: true,
                displayMode: "inline",
                showHeader: false,
            });
            $("#quote-button").show();

            let templateInstances = Handlebars.compile($("#product-instances-template").html());
            $(templateInstances(data)).insertAfter("#instances-title");


            $('span:contains("new")').addClass("is-success");
            $('span:contains("worn")').addClass("is-warning");
            $('span:contains("broken")').addClass("is-danger");
            $('span:contains("obliterated")').removeClass("is-light");
            $('span:contains("obliterated")').addClass("is-black");

            $('.pageloader').removeClass('is-active');
        },
        error: function (data) {
            alert("Something went wrong: " + data.statusText);
        }
    });

    $("#quote-button").click(function () {
        
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
            url: "https://site202114.tw.cs.unibo.it/v1/products/" + id + "/quote",
            type: "GET",
            data: data,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
            },
            success: function (response) {
                
            },
            error: function (data) {
                alert("Something went wrong: " + data.statusText);
            }
        });
    });

    $("#remove-product").click(function () {
        $.ajax({
            url: "https://site202114.tw.cs.unibo.it/v1/products/" + id,
            type: "DELETE",
            headers: {
                "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
            },
            success: function (data) {
                window.location.href = "./catalog.html";
            },
            error: function (data) {
                alert("Something went wrong: " + data.statusText);
            }
        });
    });


    // Modal
    $("#add-instance").click(function () {
        $("#add-instance-modal").addClass("is-active");
    });

    function resetModal() {
        $("#add-instance-modal").removeClass("is-active");
        $("#add-instance-form").trigger("reset");
    }

    // Close modal
    $("#add-instance-modal-close, #add-instance-modal-cancel, .modal-background").click(function () {
        resetModal();
    });
});