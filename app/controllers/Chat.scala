package controllers

import play.api.mvc.Action
import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import play.api.data.validation.Constraints._
import models._

import org.eclipse.paho.client.mqttv3.MqttCallback
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttClient
import org.eclipse.paho.client.mqttv3.MqttClientPersistence
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken
import org.eclipse.paho.client.mqttv3.MqttMessage
import org.eclipse.paho.client.mqttv3.MqttTopic;

/**
 * Created by kahlenlin on 6/30/14.
 */

object Chat extends Controller {

  var clientMQ: MqttClient = _
  // constructor
  registerMQTT

  def index = Action {
    registerMQTT
    Ok(views.html.chat("Hello, world"))
  }

  val sentMessageForm = Form(
    mapping(
      "userId" -> nonEmptyText,
      "message" -> optional(text),
      "timestamp" -> nonEmptyText,
      "topic" -> nonEmptyText
    )(ChatMessage.apply)(ChatMessage.unapply)
  )

  def sendMessage = Action { implicit request =>
    sentMessageForm.bindFromRequest.fold(
      formWithErrors => {
        // binding failure, you retrieve the form containing errors:
        BadRequest(views.html.index("Bad"))
      },
      msg => {
        val userId = msg.userId
        val timestamp = msg.timestamp
        val topic = msg.topic
        val userInput = msg.message.getOrElse("")
        println( "user(" + userId + ") sent message (" + userInput + ") on topic(" + topic + ") at " + timestamp)

        // push
        // topic: friend/me (the former one is reciever, the latter one is sender)
        publishOnTopic(topic, userInput, 2)

        Ok
      }
    )
  }

  def registerMQTT = {
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
      //TODO: Subscribe to Mqtt topic
      subscribeTopic("hello",2)

      //Callback automatically triggers as and when new message arrives on specified topic
      var callback: MqttCallback = new MqttCallback() {

        //Handles Mqtt message
        override def messageArrived(topic: String, message: MqttMessage) {
          print("--- get MQTT message --- : ");
          println(new String(message.getPayload()));

          // save this message to db
          val userId =  topic.split("/")(1)
          val receiverId = topic.split("/")(0)
          val allChatUsers = List(userId, receiverId)
          // TODO: get timestamp
          val msgRecord = ChatRecord( userId, new String(message.getPayload), "" )
          val msg2save = models.ChatHistory(allChatUsers, List(msgRecord))
          ChatHistory.putMessageToDb(msg2save)

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

  }

  def subscribeTopic( topic: String, qos: Int ) {
    clientMQ.subscribe(topic, qos)
  }

  def publishOnTopic( topic: String, message: String, qos: Int ) = {
    val mTopic: MqttTopic = clientMQ.getTopic(topic);
    val mMessage: MqttMessage = new MqttMessage(message.getBytes());
    mMessage.setQos(qos);

    try {
      mTopic.publish(mMessage);
    } catch {
      case e: Exception =>
        println(e.getStackTrace)
    }
  }

  def subscribe(u: String) = Action {
    val users = u.split(",")
    subscribeTopic( users(0) + "/" + users(1), 2 )
    subscribeTopic( users(1) + "/" + users(0), 2 )
    Ok
  }

}
