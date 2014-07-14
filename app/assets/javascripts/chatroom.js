var client = new Paho.MQTT.Client(window.location.hostname, 8000, getCookie("userId"));
var currentChatFriend = "*";

$(document).ready( function() {

    registerMqtt();
    setSendMessageSubmitBtn();

    var user = $.cookie("userId");
    console.log("user = " + user);

});

function setSendMessageSubmitBtn() {
    $('#sendBtn').click( function() {
         var msg = $("#inputMsg").val();
         console.log("msg = " + msg);

         // post to server
         // publish to topic = friend/me
         var publishTopic = currentChatFriend + "/" + getCookie("userId");
         var requestBody = '{"userId":"' + getCookie("userId") + '","message":"'+msg + '","timestamp":"'+ Date.now() + '","topic":"' + publishTopic + '"}';
         console.log("requestBody = " + requestBody);
         $.ajax({url: '/chat',
             data: requestBody,
             type: 'POST',
             async: 'true',
             dataType: 'application/json',
             contentType: 'application/json',
             complete: function(xhr, statusText) {
                 // This callback function will trigger on data sent/received complete
                 console.log("chat complete: " + xhr.status);
             },
             error: function (xhr, statusText, err) {
                 // This callback function will trigger on unsuccessful action
                 console.log("chat error: " + xhr.status);
             }
         });



         var oldMsg = $('#chatarea');
         oldMsg.append('<p class="mensagem toggle">'+msg+'</p>');

         // show on chat textarea
         $('#chatarea').val( $('#chatarea').val() + "me: " + msg + "\n");

         // empty input
         $("#inputMsg").val('');
         return false;
    });
}

function registerMqtt() {

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    client.connect({onSuccess:onConnect, onFailure:onConnectFail});

    // called when the client connects
    function onConnect() {
      // Once a connection has been made, make a subscription and send a message.
      console.log("onConnect");
      // client.subscribe("hello");
    }

    function onConnectFail() {
        console.log("connection fail");
        alert("MQTT client connect fail");
    }

    // called when the client loses its connection
    function onConnectionLost(responseObject) {
      if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:"+responseObject.errorMessage);
      }
    }

    // called when a message arrives
    function onMessageArrived(message) {
      var msg = message.payloadString;
      console.log("onMessageArrived:"+msg);

      // append message to chat textarea
      $('#chatarea').append('<p class="mensagem2 toggle">'+msg+'</p>');
    }

}

function mqttSubscribeChatUser(chatUser) {
    currentChatFriend = chatUser;
    // subscribe me/#
    var subscribeTopic = getCookie("userId") + "/#";
    console.log("subscribe topic: " + subscribeTopic);
    client.subscribe(subscribeTopic);

    // get chat history from server
    $.ajax({
            type: 'GET',
            url: '/history',
            data: {"users": getCookie("userId") + "," + chatUser},
            dataType: 'json',
            success: function (data) {
                if ( data.length !== 0 ) {
                    console.log("data: " + data);
                    var history = data.history;
                    $.each(history, function(index, msg) {
                        if ( msg.from == getCookie("userId") ) {
                            // current user's message
                            addMeChatRecord( msg.message );
                        } else {
                            // friend's message
                            addFriendChatRecord( msg.message );
                        }
                    });
                }
            }

        });
}

function addFriendChatRecord(msg) {
    // append message to chat textarea
    $('#chatarea').append('<p class="mensagem2 toggle">'+msg+'</p>');
}

function addMeChatRecord(msg) {
    var oldMsg = $('#chatarea');
    oldMsg.append('<p class="mensagem toggle">'+msg+'</p>');

    // show on chat textarea
    $('#chatarea').val( $('#chatarea').val() + "me: " + msg + "\n");
}

$(window).unload( function () {
    disconnectMqtt();
});

function disconnectMqtt() {
    // disconnect MQTT when close window
    client.disconnec();
    console.log("close MQTT connection");
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