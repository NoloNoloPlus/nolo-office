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
                let field = $(this).attr('name');
                if (!(field in Object.keys(data))){
                    $(this).val(data["address"][field]);
                }
                else{
                    $(this).val(data[field]);
                }
            });
            $('.pageloader').removeClass('is-active');
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
                if($(this).attr('name') == 'name' || $(this).attr('name') == 'email'){
                    data[$(this).attr('name')] = $(this).val();
                }
            });

            $.ajax({
                url: "https://site202114.tw.cs.unibo.it/v1/users/" + id,
                type: "PATCH",
                data: data,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
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
});