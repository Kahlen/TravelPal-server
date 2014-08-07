package controllers

import com.google.android.gcm.server.{Sender, Constants, Result, MulticastResult}
import play.api.mvc.Action
import play.api.Logger
import play.api.mvc.BodyParsers.parse
import scala.concurrent.Future

import play.api._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.functional.syntax._
import play.api.libs.json._
import models.User
import play.api.data.Forms._

import reactivemongo.api._
import reactivemongo.core.errors.DatabaseException
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import play.api.data.Form
import models._
import models.GCMDeviceJsonFormats._

/**
 * Created by kahlenlin on 8/6/14.
 */
object GCMController extends Controller with MongoController {
  val senderId = "1026505725242" // project number
  val apiKey = "AIzaSyCXmU_LH727AAiO__Lb4WLoPGtnVuZmfyI"

  val sender: Sender = new Sender(apiKey)

  def collection: JSONCollection = db.collection[JSONCollection]("gcmDevice")

  def register = Action.async(parse.json) { request =>
    Logger.debug("register post: " + request)
    /*
     * request.body is a JsValue.
     * There is an implicit Writes that turns this JsValue as a JsObject,
     * so you can call insert() with this JsValue.
     * (insert() takes a JsObject as parameter, or anything that can be
     * turned into a JsObject using a Writes.)
     */
    request.body.validate[GCMDevice].map { device =>
      // `user` is an instance of the case class `models.User`
      Logger.debug("insert device: " + device)
      collection.update( Json.obj("_id" -> device._id), device, upsert = true).map { lastError =>
        Logger.debug(s"Successfully inserted with LastError: $lastError")
        Created
      } recover {
        // insert error
        case e: DatabaseException =>
          Logger.debug("error insert class: " + e.getMessage)
          e.printStackTrace()
          InternalServerError
        case e: Exception =>
          e.printStackTrace()
          InternalServerError
      }
    }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  def unregister(userId: String) = {
    collection.remove(Json.obj("_id" -> userId))
  }

  val requestTotal = 100
  var sendTime = new Array[Long](requestTotal)
  var receiveTime = new Array[Long](requestTotal)
  var sendCount = 0

  def pushNotificationAuto() = Action {
    val notification = GCMNotification( sendCount + "/1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111", None)
    val message2push = notification.asMessage
    sender.send(message2push, "APA91bFikQSmsNwZyQ_VTKLprpx4w9ONZzKRUS8NlAmKz2gj_cr_5qLnvXh8jauii5sduTLtEhEPQ10xciU1ZPNpP2Vfq9_N9hxsry5BdvlAUEJfMsYPWHAiGEIyDt1KCshPGkT7Q2F7pTbcxy8lrWkGdY7xMSsyHA", 5)
    val currentTime = java.lang.System.currentTimeMillis
    sendTime(sendCount) = currentTime
    System.err.println( "%4d".format(sendCount) + ": " + currentTime)
    sendCount += 1
    Ok("Hello, world")
  }

  def pushNotificationPong(count: Integer) = Action {
    val currentTime = java.lang.System.currentTimeMillis
    receiveTime(count) = currentTime
    System.err.println( "%4d".format(count) + ": " + currentTime)
    Ok("Hello. world")
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

  def getCurrentProgress() = Action {
    val result = "sendCount: " + sendCount
    Ok(result)
  }

  def endPerformanceTest() = Action {
    Logger.debug("end test")
    sendTime = new Array[Long](requestTotal)
    receiveTime = new Array[Long](requestTotal)
    sendCount = 0
    Ok("Bye, world!")
  }

  def pushNotification(userId: String, message: String, collapseKey: Option[String]) = Action.async {
    val notification = GCMNotification(message, collapseKey)

    val cursor: Cursor[GCMDevice] = collection.find(Json.obj("_id" -> userId)).cursor[GCMDevice]
    val futureDeviceList: Future[List[GCMDevice]] = cursor.collect[List]()
    futureDeviceList.map { i =>
      if ( i.size > 0 ) {
        var device = i(0)
        val message2push = notification.asMessage
        // send message to GCM server
        val sendResult = sender.send(message2push, device.registrationId, 5)
        Logger.debug("sent message id: " + sendResult.getMessageId )
        Logger.debug("sent message error code name: " + sendResult.getErrorCodeName )
      } else {
        Logger.debug("user(" + userId + ") doesn't have registration ID registered yet.")
      }
      Ok
    }

  }

}
