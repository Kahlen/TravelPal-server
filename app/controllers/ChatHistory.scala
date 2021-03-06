package controllers

import play.api._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.functional.syntax._
import play.api.libs.json._
import scala.concurrent.Future

// Reactive Mongo imports
import reactivemongo.api._
import reactivemongo.core.errors.DatabaseException

import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import play.api.data.Form
import models._
import models.ChatHistoryJsonFormats._

/**
 * Created by kahlenlin on 7/14/14.
 */
object ChatHistory extends Controller with MongoController {

    def collection: JSONCollection = db.collection[JSONCollection]("chatHistory")

    def putMessageToDb(msg: ChatHistory) = {

      try {
        // check if this (from, to) exist
        val cursor = collection.find(Json.obj("users" -> Json.obj( "$size" -> msg.users.length, "$all" -> msg.users ))).cursor[ChatHistory]
        // gather all the JsObjects in a list
        val futureUsersList: Future[List[ChatHistory]] = cursor.collect[List]()
        futureUsersList.map { h =>
          if (h.isEmpty) {
            // no history => insert
            Logger.debug("no history => insert")
            collection.insert(msg)
          } else {
            // update
            Logger.debug("update history: " + msg.history(0).message)
            collection.update(
              Json.obj("users" -> Json.obj( "$size" -> msg.users.length, "$all" -> msg.users )),
              Json.obj("$push" -> Json.obj( "history" -> Json.obj("$each" -> msg.history)   ))
            )
          }
        }

      } catch {
        case e: Exception => e.printStackTrace()
      }

    }

    // users are passed in with "," e.g. /history?users=user,testid5
    def getChatHistoryFromDb(u: String) = Action.async {
      val users = u.split(",")
      // let's do our query
      val cursor: Cursor[ChatHistory] = collection.
        // find all people with name `name`
        find(Json.obj("users" -> Json.obj( "$size" -> users.length, "$all" -> users ))).
        // sort them by creation date
        sort(Json.obj("from" -> 1)).
        // perform the query and get a cursor of JsObject
        cursor[ChatHistory]

      // gather all the JsObjects in a list
      val futureHistoryList: Future[List[ChatHistory]] = cursor.collect[List]()

      // everything's ok! Let's reply with the array
      futureHistoryList.map { h =>
        if (h.isEmpty) {
          // return an empty JSON if there's no history
          Ok(Json.obj())
        } else {
          Logger.debug("getChatHistoryFromDb: " + h(0))
          Ok(Json.toJson(h(0)))
        }

      }
    }

}
