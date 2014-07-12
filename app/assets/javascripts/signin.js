$(document).ready( function() {

    setSignInSubmitBtn();
    setJoinSubmitBtn();

});

function setSignInSubmitBtn() {
    $('#signInBtn').click( function() {
        var user = $('#_id').val();
        var password = $('#password').val();
        console.log("user: " + user + ", password: " + password);
        var requestBody = '{"_id":"' + user + '","password":"'+password + '","name":""}';
        console.log("requestBody = " + requestBody);

        $.ajax({url: '/login',
            data: requestBody,
            type: 'POST',
            async: 'true',
            dataType: 'application/json',
            contentType: 'application/json',
            complete: function(xhr, statusText) {
                // This callback function will trigger on data sent/received complete
                console.log("login complete: " + xhr.status);
                window.location.href = "/";

                //set cookie
                $.cookie("userId", user);
            },
            error: function (xhr, statusText, err) {
                // This callback function will trigger on unsuccessful action
                console.log("login error: " + xhr.status);
                if ( xhr.status == 404 ) {
                    console.log("user not found");
                }
            }
        });

        return false;
    });
}

function setJoinSubmitBtn() {
    $('#joinBtn').click( function() {
        var user = $('#_id').val();
        var password = $('#password').val();
        console.log("user: " + user + ", password: " + password);
        var requestBody = '{"_id":"' + user + '","password":"'+password + '","name":"name"}';
        console.log("requestBody = " + requestBody);

        $.ajax({url: '/create',
            data: requestBody,
            type: 'POST',
            async: 'true',
            dataType: 'application/json',
            contentType: 'application/json',
            complete: function(xhr, statusText) {
                // This callback function will trigger on data sent/received complete
                console.log("login complete: " + xhr.status);
            },
            error: function (xhr, statusText, err) {
                // This callback function will trigger on unsuccessful action
                console.log("login error: " + xhr.status);
                if ( xhr.status == 404 ) {
                    console.log("user not found");
                }
            }
        });

        return false;
    });
}