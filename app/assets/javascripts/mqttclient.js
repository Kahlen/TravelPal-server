var client = new Paho.MQTT.Client(window.location.hostname, 8000, getCookie("userId"));

function registerMqtt() {

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    client.connect({onSuccess:onConnect, onFailure:onConnectFail});

    // called when the client connects
    function onConnect() {
      // Once a connection has been made, make a subscription and send a message.
      console.log("onConnect");
      // subscribe as soon as connected
      subscribeMQTTtopic();
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
      var topic = message.destinationName;
      console.log("onMessageArrived(" + topic + "):"+msg);

      // response according to topic
      var topicHie = topic.split("/");
      var topicType = topicHie[topicHie.length-1];
      if ( topicType == "newChat" ) {
        // chat message
        // append message to chat textarea
        if ( $("#findFriendsBtn").hasClass("active")) {
            var chatwith = topicHie[topicHie.length-2];
            // only update chat text area if the current chat user is the sender
            if ( $("#chat_" + chatwith).hasClass("double") ) {
                $('#chatarea').append('<p class="mensagem2 toggle">'+msg+'</p>');
                scrollTextareaToEnd();
            }
        }

        $("#findFriendsBtn").addClass('notify');
      } else if ( topicType == "addItinerary" ) {
        // new itinerary
        $("#myTripsBtn").addClass('notify');
      } else if ( topicType == "updateItinerary" ) {
        // new itinerary feed/comment
        $("#myTripsBtn").addClass('notify');
      } else if ( topicType == "addFriend" ) {
        // is added friend
        $("#findFriendsBtn").addClass('notify');
      }


    }

}

function disconnectMqtt() {
    // disconnect MQTT when close window
    client.disconnec();
    console.log("close MQTT connection");
}

function subscribeMQTTtopic() {
    var subscribeTopic = getCookie("userId") + "/#";
    console.log("subscribe topic: " + subscribeTopic);
    client.subscribe(subscribeTopic);
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