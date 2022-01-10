Object.defineProperty(String.prototype, 'capitalize', {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});

function emptyToNone(obj) {
    for (var i in obj) {
        if (obj[i] === null || obj[i] === undefined || obj[i] === '') {
            obj[i] = 'none';
        } else if (typeof obj[i] === 'object') {
            emptyToNone(obj[i]);
        }
    }
}

function removeEmpty(obj) {
    for (var i in obj) {
        if (obj[i] === null || obj[i] === undefined || obj[i] === '') {
            delete obj[i];
        }
    }
}

$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search);
    let id = searchParams.get('id');
    $("#client-id").append(id);

    $.ajax({
        url: "https://site202114.tw.cs.unibo.it/v1/users/" + id,
        type: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
        },
        success: function (data) {
            console.log(data);
            $('input').each(function () {
                let field = String($(this).attr('name'));
                if (!(Object.keys(data).includes(field))) {
                    if (field == "line1" || field == "line2") {
                        $(this).val((data["address"]["street"][field] != "none") ? data["address"]["street"][field] : "");
                    }
                    else{
                        $(this).val((data["address"][field] != "none") ? data["address"][field] : "");
                    }
                }
                else{
                    $(this).val((data[field] != "none") ? data[field] : "");
                }
            });

            $("#client-role").append(data["role"]);
            $("#avatar-image").attr("src", data["avatarUrl"] || "http://www.gravatar.com/avatar/ee194f150caf4ef175b36caaeb2f7782.jpg?s=48&d=mm");
            
            
            $(".pageloader").removeClass('is-active');

        },
        error: function (data) {
            alert("Something went wrong: " + data.statusText);
        }
    });

    $.ajax({
        url: "https://site202114.tw.cs.unibo.it/v1/rentals",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
        },
        success: function (resp) {
            data = resp.results.filter((v) => v.userId == id);
            for (let i=0; i<data.length; i++) {
                data[i]["productId"] = Object.keys(data[i].products)[0]
                let [startDate, endDate] = findBoundaries(data[i]);

                if (endDate > new Date()) {
                    $("#delete-client").hide();
                }

                data[i]["startDate"] = startDate.toISOString().split("T")[0];
                data[i]["endDate"] = endDate.toISOString().split("T")[0];

                data[i]["price"] = rentalPrice(data[i], false).toFixed(2);
            }
            console.log(data);
            let templateRentals = Handlebars.compile($("#client-rentals-template").html());
            $("table").html(templateRentals(data));
        }
    })

    function restoreState() {
        $("#update-client-pending").hide();
        $("#cancel-update").hide();
        $("#update-client").show();
        $("input[readonly]").attr('readonly', 'readonly');
    }

    $("#update-client").click(function () {
        $(this).hide();
        $("#update-client-pending").show();
        $("#update-client-pending").removeClass("is-loading");
        $("#cancel-update").show();
        $("input[readonly]").removeAttr('readonly');
        $(":disabled").removeAttr('disabled');

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

            let patchData = {
                address: {
                    street: {
                    }
                }
            };

            $('input').each(function () {
                let name = $(this).attr("name");
                if(name == "line1" || name == "line2"){
                    patchData["address"]["street"][name] = $(this).val();
                } else if(name == "city" || name == "country" || name == "zip" || name == "state"){
                    patchData["address"][name] = $(this).val();
                } else {
                    patchData[name] = $(this).val();
                }
            });

            emptyToNone(patchData.address);
            removeEmpty(patchData);
            console.log(patchData);

            $.ajax({
                url: "https://site202114.tw.cs.unibo.it/v1/users/" + id,
                type: "PATCH",
                data: patchData,
                // contentType: "application/json; charset=utf-8",
                // dataType: "json",
                headers: {
                    "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
                },
                success: function (data) {
                    $(this).removeClass('is-loading');
                    restoreState();
                },
                error: function (data) {
                    $(this).removeClass('is-loading');
                    console.log(data.responseText);
                }
            });
        });
    });

    $("table").on('click', 'tr', function () {
        let id = $(this).find("#rental-id").html();
        window.location.href = "../rentals/rental.html?id=" + id;
    });

    $("#delete-client").click(function () {
        $.ajax({
            url: "https://site202114.tw.cs.unibo.it/v1/users/" + id,
            type: "DELETE",
            headers: {
                "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
            },
            success: function (data) {
                window.location.href = "./overview.html";
            },
            error: function (data) {
                alert("Something went wrong: " + data.statusText);
            }
        })
    });
});