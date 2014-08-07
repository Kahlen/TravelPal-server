package controllers

import play.api._
import play.api.mvc._
import play.mvc.Http

object Application extends Controller {

  def index = Action { request =>
    // for test
//    initClient

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
  var sendCount = 0

  def initClient() = {
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

      //Callback automatically triggers as and when new message arrives on specified topic
      var callback: MqttCallback = new MqttCallback() {

        //Handles Mqtt message
        override def messageArrived(topic: String, message: MqttMessage) {
          val currentTime = java.lang.System.currentTimeMillis
          receiveCount +=1
          System.err.println( "%4d".format(receiveCount) + ": " + currentTime)
        }

        override def deliveryComplete(arg0: IMqttDeliveryToken) {
//          System.err.println("delivery complete")
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
  }

  val requestTotal = 100
  var sendTime = new Array[Long](requestTotal)
  var receiveTime = new Array[Long](requestTotal)
  def testMqttPerformanceAuto(qos: Integer) = Action {
    try {
      val topic = "user/" + sendCount
      // 100 bytes
      val message = "1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111"
      val mTopic: MqttTopic = clientMQ.getTopic(topic);
      val mMessage: MqttMessage = new MqttMessage(message.getBytes());
      mMessage.setQos(qos);
      mTopic.publish(mMessage);
      val currentTime = java.lang.System.currentTimeMillis
      sendTime(sendCount) = currentTime
      System.err.println( "%4d".format(sendCount) + ": " + currentTime)
      sendCount += 1
    } catch {
      case e: Exception => e.printStackTrace()
    }

    Ok("Hello, world!")
  }

  def testMqttPerformancePong(count: Integer) = Action {
    val currentTime = java.lang.System.currentTimeMillis
    receiveTime(count) = currentTime
    System.err.println( "%4d".format(count) + ": " + currentTime)
    Ok("Hello, world!")
  }

  def getLatency() = Action {
    var latencySum = 0l
    var lostCount = 0
    for ( i <- 0 until requestTotal) {
      if ( receiveTime(i) != 0l ) {
        latencySum = latencySum + ( receiveTime(i) - sendTime(i) )
      } else {
        lostCount += 1
      }
    }

    val latencyAve = latencySum.toDouble/(requestTotal-lostCount)
    val output = new StringBuilder("latency sum: " + latencySum + "\n")
    output ++= "latency average: " + latencyAve + "\n"
    output ++= "lost: " + lostCount + "\n"
    Ok(output.toString)
  }

  def testMqttPerformance(qos: Integer) = Action {
    val topic = "mqtt-malaria/#"
    Logger.debug("start to test, subscribe topic(" + topic + ") with Qos " + qos)
    try {
      clientMQ.subscribe(topic, qos)
    } catch {
      case e: Exception => e.printStackTrace()
    }

    Ok("Hello, world!")
  }

  def endMqttPerformanceTest() = Action {
    Logger.debug("end test")
    sendTime = new Array[Long](requestTotal)
    receiveTime = new Array[Long](requestTotal)
    receiveCount = 0
    sendCount = 0
    if ( clientMQ != null && clientMQ.isConnected )
      clientMQ.disconnect
    Ok("Bye, world!")
  }

}