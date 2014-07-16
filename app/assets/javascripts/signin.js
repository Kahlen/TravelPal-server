$(document).ready( function() {

    setSignInSubmitBtn();
    setJoinSubmitBtn();

});

function setSignInSubmitBtn() {
    $('#signInBtn').click( function() {
        var user = $('#username').val();
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
                if ( xhr.status == 404 ) {
                    console.log("user not found");
                    $('.invalidLogin').css("display","inline");
                } else {
                    window.location.href = "/";
                    //set cookie
                    $.cookie("userId", user);
                }

            },
            error: function (xhr, statusText, err) {
                // This callback function will trigger on unsuccessful action
                console.log("login error: " + xhr.status);
                if ( xhr.status == 404 ) {
                    console.log("user not found");
                    $('.invalidLogin').css("display","inline");
                }
            }
        });

        return false;
    });
}

function setJoinSubmitBtn() {

    $('#joinBtn').click( function() {
        var user = $('#usernamesignup').val();
        var password = $('#passwordsignup').val();
        var name = $('#emailsignup').val();
        console.log("user: " + user + ", password: " + password + ", name: " + name);
        var requestBody = '{"_id":"' + user + '","password":"'+password + '","name":"' + name + '"}';
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
                if ( xhr.status == 201 ) {
                    window.location.href = "/";
                    //set cookie
                    $.cookie("userId", user);
                }
            },
            error: function (xhr, statusText, err) {
                // This callback function will trigger on unsuccessful action
                console.log("login error: " + xhr.status);
                if ( xhr.status == 406 ) {
                    console.log("user id duplicated");
                    $('.invalidPassword').css("display","inline");
                    $('.invalidPassword').text("The username already exists");
                } else if ( xhr.status != 201 ) {
                    console.log("server error");
                    $('.invalidPassword').css("display","inline");
                    $('.invalidPassword').text("Server error...");
                }
            }
        });


        return false;
    });
}