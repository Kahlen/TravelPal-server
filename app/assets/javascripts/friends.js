$(document).ready( function() {
    var user = $.cookie("userId");
    console.log("user = " + user);

//    var updated_users = ["name1", "name2", "name3"];
//    update_list(updated_users);

    getFriends();
});

function getFriends() {

    $.ajax({
        type: 'GET',
        url: '/searchf',
        data: {"id": getCookie("userId")},
        dataType: 'json',
        success: function (data) {
            console.log("data: " + data);
            var friends = data.friends;
            $.each(friends, function(index,user) {
                var item = $("<li class='me' style='display: none;'>" + user._id + "<i class='icon-minus pull-right'></i></li>");


                $("#removeList").append(item);

                if ( user.isFriend ) {
                    // if this user is friend, change the background color
                    item.toggleClass("pressed");
                }

                $("#removeList").find("li.me:last-child").slideDown();
                friendClick();
//                $('#friendsList .list').append('<li><h3 class="name">User: '+ user._id +'</h3></li>');
              });
        }

    });

}

function friendClick() {

    //removing from list
    $("ul").off().on("click", "li", function(event) {
      $(this).find("i").addClass("icon-rotate-90");
      // change background color
      $(this).toggleClass("pressed");

      var user = $(this).text(); // user id
      console.log(user + " clicked");

      var requestBody = '{"id":"' + getCookie("userId") + '","friend":"'+user + '"}';
      console.log("requestBody = " + requestBody);

      if ( $(this).is('.me.pressed') ) {
        // --- add friend ---
        console.log("add friend: " + user);

        $.ajax({url: '/addf',
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
            }
        });


      } else {
        // --- remove friend ---
        console.log("remove friend: " + user);
        $.ajax({url: '/removef',
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
            }
        });
      }

      return false;
    })
    .on("dblclick", "li", function(event) {
        var user = $(this).text(); // user id
        console.log(user + " is double clicked");
        $(this).toggleClass("double");
        // subscribe this user
        // me/friend (receiver/sender)
        mqttSubscribeChatUser(user);

        $('ul li').each(function(i) {
           if ($(this).hasClass('double') && $(this).text() != user ) {
                //toggle other friends to pressed if it was double
                console.log( $(this).text() + "should be toggled: " );
                $(this).removeClass( "double" ).addClass( "pressed" );
           }
        });

        return false;
    });


}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
    }
    return "";
}