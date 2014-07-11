//function parseMessage( form ) {
//    var msg = form.inputMessage.value;
//    console.log("msg = " + msg);
//    messageTextArea.value += msg;
//}

var client = new Paho.MQTT.Client(window.location.hostname, 8000, "testClientId");

$(document).ready( function() {

    registerMqtt();
    setSendMessageSubmitBtn();

    var user = $.cookie("userId");
    console.log("user = " + user);

});

function setSendMessageSubmitBtn() {
    $('#submitMessage').click( function() {
         var msg = $("#inputMessage").val();
         console.log("msg = " + msg);

         // post to server
         $.post("/chat", $('#messageForm').serialize());

         // show on chat textarea
         $('#messageTextArea').val( $('#messageTextArea').val() + "me: " + msg + "\n");

         // empty input
         $("#inputMessage").val('');
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
      $('#messageTextArea').val( $('#messageTextArea').val() + "other: " + msg + "\n");
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