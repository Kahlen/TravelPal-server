var client = new Paho.MQTT.Client(window.location.hostname, 8000, "testClientId");

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
         $.post("/chat", $('#messageForm').serialize());

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
    // TODO: define user id
//    var client = new Paho.MQTT.Client(window.location.hostname, 8000, "testClientId");
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    client.connect({onSuccess:onConnect, onFailure:onConnectFail});

    // called when the client connects
    function onConnect() {
      // Once a connection has been made, make a subscription and send a message.
      console.log("onConnect");
      client.subscribe("hello");
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

$(window).unload( function () {
    disconnectMqtt();
});

function disconnectMqtt() {
    // disconnect MQTT when close window
    client.disconnec();
    console.log("close MQTT connection");
}