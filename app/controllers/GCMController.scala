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
  val senderId = "sender_id" // project number
  val apiKey = "api_key"

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
