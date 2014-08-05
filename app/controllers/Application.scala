package controllers

import play.api._
import play.api.mvc._
import play.mvc.Http

object Application extends Controller {

  def index = Action { request =>
    request.cookies.get("userId") match {
      case None =>
        Ok(views.html.index("Hello, world"))
      case Some(x) =>
        val userId = x.value
        Logger.debug("userId = " + userId)
        if ( userId == null || userId.isEmpty || userId.equals("null"))
          Ok(views.html.index("Hello, world"))
        else
          Ok(views.html.front("Hello, world"))
    }

  }


  import org.eclipse.paho.client.mqttv3.MqttCallback
  import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
  import org.eclipse.paho.client.mqttv3.MqttClient
  import org.eclipse.paho.client.mqttv3.MqttClientPersistence
  import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence
  import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken
  import org.eclipse.paho.client.mqttv3.MqttMessage
  import org.eclipse.paho.client.mqttv3.MqttTopic
  var clientMQ: MqttClient = _
  var receiveCount = 0

  def testMqttPerformance(topic: String, qos: Integer) = Action {
    Logger.debug("start to test, subscribe topic(" + topic + ") with Qos " + qos)
    try {
      // Eclipse Paho + HiveMQ
      val brokerUrl: String = "tcp://localhost:1883"

      //Set up persistence for messages
      var peristance: MqttClientPersistence = new MemoryPersistence()

      //Initializing Mqtt Client specifying brokerUrl, clientID and MqttClientPersistance
      clientMQ = new MqttClient(brokerUrl, "TravelPalServer", peristance)

      var mqttOptions: MqttConnectOptions = new MqttConnectOptions()
      // set clean session to false so that when reconnected, it gets messages happen when the connection was lost
      mqttOptions.setCleanSession( false )
      mqttOptions.setKeepAliveInterval(30)

      //Connect to MqttBroker
      clientMQ.connect( mqttOptions )
      clientMQ.subscribe(topic, qos)

      //Callback automatically triggers as and when new message arrives on specified topic
      var callback: MqttCallback = new MqttCallback() {

        //Handles Mqtt message
        override def messageArrived(topic: String, message: MqttMessage) {
          val currentTime = java.lang.System.currentTimeMillis
          receiveCount +=1
          System.err.println( "%4d".format(receiveCount) + ": " + currentTime)
        }

        override def deliveryComplete(arg0: IMqttDeliveryToken) {
          System.err.println("delivery complete")
        }

        override def connectionLost(arg0: Throwable) {
          System.err.println("Connection lost " + arg0)

        }

      };

      //Set up callback for MqttClient
      clientMQ.setCallback(callback);
    } catch {
      case e: Exception => e.printStackTrace()
    }

    Ok("Hello, world!")
  }

  def endMqttPerformanceTest() = Action {
    Logger.debug("end test")
    receiveCount = 0
    if ( clientMQ != null )
      clientMQ.disconnect
    Ok("Bye, world!")
  }

}