
Handlebars.registerHelper("offset", function (value, options) {
    return parseInt(value) + 2;
});

Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

$(document).ready(function () {

    let searchParams = new URLSearchParams(window.location.search);
    let id = searchParams.get('id');
    var quote, instances;
    var product;

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

            product = JSON.parse(JSON.stringify(data));
            delete product.id;
            instances = data.instances;

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
            bulmaCalendar.attach('[type="date"]', {
                isRange: true,
                displayMode: "inline",
                showHeader: false,
            });
            $("#quote-button").show();


            $(':not(#statusfield) > span:contains("new")').addClass("is-success");
            $(':not(#statusfield) > span:contains("worn")').addClass("is-warning");
            $(':not(#statusfield) > span:contains("broken")').addClass("is-danger");
            $(':not(#statusfield) > span:contains("obliterated")').removeClass("is-light");
            $(':not(#statusfield) > span:contains("obliterated")').addClass("is-black");

            let templateDiscount = Handlebars.compile($("#product-discounts-template").html());
            $("#product-discounts").append(templateDiscount(data.discounts));
        },
        error: function (data) {
            alert("Something went wrong: " + data.statusText);
        }
    }).then(function () {
        $.ajax({
            url: "https://site202114.tw.cs.unibo.it/v1/rentals",
            type: "GET",
            headers: {
                "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
            },
            success: function (data) {
                console.log(data);

                let templateInstances = Handlebars.compile($("#product-instances-template").html());
                $(templateInstances(instances)).insertAfter("#instances-title");

                for (const r of data.results) {
                    for (const [k, v] of Object.entries(r.products)) {
                        if (k == id) {
                            $("#remove-product").hide();
                            console.log(v);
                            for (const [k2, v2] of Object.entries(v.instances)) {
                                $("#remove-instance[instanceid=" + k2 + "]").hide();
                            }
                        }
                    }
                }

                $('.pageloader').removeClass('is-active');
            },
            error: function (data) {
                alert("Something went wrong: " + data.statusText);
            }
        })
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
                console.log(response);

                quote = JSON.parse(JSON.stringify(response));

                augmentQuote(response);

                let template = Handlebars.compile($("#breakdown-template").html());
                $("#breakdown").html('<p class="title is-3">Quote breakdown</p>');
                $("#breakdown").append(template(response));
                $("#breakdown-box").show();
            },
            error: function (data) {
                if (data.status == 500) {
                    $("#error").html("No available instances for this period");
                }
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


    $(document).on("click", "#confirm-quote-button", function () {
        $.ajax({
            url: "https://site202114.tw.cs.unibo.it/v1/users", 
            type: "GET",
            headers: {
                "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
            },
            success: function (data) {
                let user = data.results.find(x => x.email == $("#clientEmail").val());
                if (!user) {
                    $("#no-email").html("Nessun utente con questa mail");
                } else {
                    $("#no-email").html("");
                    let data = {};
                    data.approvedBy = JSON.parse(localStorage.getItem("user"))["id"];
                    data.products = {
                        [id]: quote,
                    };
                    data.discounts = [];
                    
                    let from = new Date($("#bulma-calendar")[0].bulmaCalendar.startDate);
                    let to = new Date($("#bulma-calendar")[0].bulmaCalendar.endDate);
                    let today = new Date();

                    from.setHours(0, 0, 0, 0);
                    to.setHours(23, 59, 59, 999);
                    today.setHours(0, 0, 0, 0);

                    if (from <= today) {
                        if (to < today) {
                            data.status = "closed";
                        } else {
                            data.status = "active";
                        }
                    } else {
                        data.status = "ready";
                    }    

                    data.userId = user.id;
                    for (const [k, v] of Object.entries(data.products)) {
                        for (const [k2, v2] of Object.entries(v.instances)) {
                            delete v2.currentStatus;
                            delete v2.name;
                            delete v2.logs;
                        }
                    }
                    $.ajax({
                        url: "https://site202114.tw.cs.unibo.it/v1/rentals",
                        type: "POST",
                        data: JSON.stringify(data),
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
                        },
                        success: function (data) {
                            $("#confirmation").html("Noleggio creato con successo");
                            setTimeout(() => {
                                $("#confirmation").html("");
                            }, 3000);
                        },
                        error: function (data) {
                            alert("Something went wrong: " + data.responseText);
                        }
                    })
                }
            }
        });
        
    });


    $(document).on("click", ".tag.is-clickable", function (e) {
        $(e.target).parent().children().removeClass("is-primary");
        $(e.target).parent().children().addClass("is-light");
        $(e.target).removeClass("is-light");
        $(e.target).addClass("is-primary");
    });

    $(document).on("click", "#edit-instance", function () {
        $("#edit-instance-modal").addClass("is-active");
        $(".modal-card-title").html("Modifica istanza");
        $(".modal").attr("modalId", $(this).attr("instanceid"));

        let inst = instances[$(this).attr("instanceid")];
        $("#statusfield > span:contains(" + inst.currentStatus + ")").addClass("is-primary");
        $("#statusfield > span:contains(" + inst.currentStatus + ")").removeClass("is-light");

        let template = Handlebars.compile($("#dateranges-template").html());
        $("#dateranges").prepend(template(inst));
        
        $("#instance-name").val(inst.name);
        
        let templateInstDiscounts = Handlebars.compile($("#instance-discounts-template").html());
        $("#instance-discounts").html(templateInstDiscounts(inst.discounts));

        console.log(inst);
    });


    // Dateranges
    $(document).on("click", "#add-daterange", function () {
        $("#dateranges").append($("#empty-dateranges-template").html());
    });

    $(document).on("click", "#remove-daterange", function () {
        $("#dateranges").children().last().remove();
    });

    // Daterange discounts
    $(document).on("click", ".add-daterange-discount", function (e) {
        $(e.target).closest(".daterange").find(".daterange-discounts").append($("#empty-daterange-discount-template").html());
    });

    $(document).on("click", ".remove-daterange-discount", function (e) {
        $(e.target).closest(".daterange").find(".daterange-discounts").children().last().remove();
    });


    // Instance discounts
    $(document).on("click", "#add-instance-discount", function () {
        $("#instance-discounts").append($("#empty-instance-discount-template").html());
    });

    $(document).on("click", "#remove-instance-discount", function () {
        $("#instance-discounts").children().last().remove();
    });

    // Product discounts
    $("#add-product-discount").click(function () {
        $("#product-discounts").append($("#empty-product-discount-template").html());
    });

    $("#remove-product-discount").click(function () {
        $("#product-discounts").children().last().remove();
    });

    function resetModal() {
        $("#edit-instance-modal").removeClass("is-active");
        $("#edit-instance-form").trigger("reset");
        $("#statusfield > span").removeClass("is-primary");
        $("#dateranges").html("");
    }

    // Close modal
    $("#edit-instance-modal-close, #edit-instance-modal-cancel, .modal-background").click(function () {
        resetModal();
    });

    // Add instance
    $("#add-instance").click(function () {
        $("#edit-instance-modal").addClass("is-active");
        $(".modal-card-title").html("Aggiungi istanza");
        let modalId = "id" + Math.random().toString(16).slice(3);
        while (instances[modalId] != undefined) {
            modalId = "id" + Math.random().toString(16).slice(3);
        }
        $(".modal").attr("modalId", modalId);
    });

    $(document).on('click', "#remove-instance", function (e) {
        console.log(product);
        delete product.instances[$(e.target).attr("instanceid")];
        
        $.ajax({
            url: "https://site202114.tw.cs.unibo.it/v1/products/" + id,
            type: "PUT",
            data: product,
            headers: {
                "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
            },
            success: function (data) {
                window.location.reload();
            },
            error: function (data) {
                alert("Something went wrong: " + data.responseText);
            }
        })
    });

    // Submit instance changes
    $("#submit-instance-changes").click(function () {
        var valid = true;
        var newIstance = {
            name: $("#instance-name").val(),
            currentStatus: $("#statusfield").find(".tag.is-primary").html(),
            logs: []
        };

        if (newIstance.name == "" || newIstance.currentStatus == undefined) {
            alert("Compila tutti i campi");
            return;
        }

        let availabilities = [];
        $(".daterange").each(function () {
            let dr = {};
            let from = new Date($(this).find("#from").val());
            let to = new Date($(this).find("#to").val());
            
            dr.price = $(this).find("#price").val();
            dr.discounts = [];
            $(this).find(".daterange-discounts").children().each(function () {
                let d = {};
                d.name = $(this).find("#name").val();
                d.description = $(this).find("#description").val();
                d.value = $(this).find("#value").val();
                d.type = $(this).find(".tag.is-primary").html();
                dr.discounts.push(d);
                if (d.name == "" || d.description == "" || d.value == "" || d.type == undefined) {
                    valid = false;
                    return false;
                }
            });
            if (dr.from == "Invalid Date" || dr.to == "Invalid Date" || dr.price == "" || !valid) {
                valid = false;
                return false;
            } else {
                dr.from = from.toISOString().split("T")[0];
                dr.to = to.toISOString().split("T")[0];
            }
            availabilities.push(dr);
        });

        let discounts = [];
        $(".instance-discount").each(function () {
            let d = {};
            d.name = $(this).find("#name").val();
            d.description = $(this).find("#description").val();
            d.type = $(this).find(".tag.is-primary").html();
            d.value = $(this).find("#value").val();
            console.log(d);
            if (d.name == "" || d.description == "" || d.value == "" || d.type == undefined) {
                valid = false;
                return false;
            }
            discounts.push(d);
        });

        if (valid) {
            newIstance.availability = availabilities;
            newIstance.discounts = discounts;
            product.instances[$(".modal").attr("modalId")] = newIstance;
            console.log(product);
            $.ajax({
                url: "https://site202114.tw.cs.unibo.it/v1/products/" + id,
                type: "PUT",
                data: product,
                headers: {
                    "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
                },
                success: function (data) {
                    resetModal();
                    window.location.reload();
                },
                error: function (data) {
                    alert("Something went wrong: " + data.responseText);
                }
            })
        } else {
            alert("Compila tutti i campi");
        }
    });

    // Submit object changes
    $("#submit-changes").click(function (e) {
        var valid = true;
        product.discounts = [];
        let discounts = [];
        $(".product-discount").each(function () {
            let data = {};
            data.description = $(this).find("#description").val();
            data.name = $(this).find("#name").val();
            data.value = $(this).find("#value").val();
            data.type = $(this).find(".tag.is-primary").html();
            if (data.type == undefined || data.name == "" || data.value == "" || data.description == "") {
                alert("Compila tutti i campi");
                valid = false;
                return false;
            }
            discounts.push(data);
        });
        if (valid) {
            product.discounts = discounts;
            $.ajax({
                url: "https://site202114.tw.cs.unibo.it/v1/products/" + id,
                type: "PUT",
                data: product,
                headers: {
                    "Authorization": "Bearer " + JSON.parse(localStorage.getItem("tokens"))["access"]["token"]
                },
                success: function (data) {
                    $("#submit-successful").html("Modifiche salvate con successo");
                    setTimeout(() => {
                        $("#submit-successful").html("");
                    }, 3000);
                },
                error: function (data) {
                    alert("Something went wrong: " + data.responseText);
                }
            })
        }
    });
});