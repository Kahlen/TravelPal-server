package controllers

import play.api._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.functional.syntax._
import play.api.libs.json._
import scala.concurrent.Future
import models.User
import play.api.data.Forms._
import scala.text
import models.ItineraryRecord

// Reactive Mongo imports
import reactivemongo.api._
import reactivemongo.core.errors.DatabaseException

import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import play.api.data.Form
import models._
import models.ItineraryJsonFormats._

/**
 * Created by kahlenlin on 7/20/14.
 */
object Itinerary extends Controller with MongoController {

  def collection: JSONCollection = db.collection[JSONCollection]("itineraries")

  def createFromJson = Action.async(parse.json) { request =>
    Logger.debug("insert itinerary post: " + request)
    /*
     * request.body is a JsValue.
     * There is an implicit Writes that turns this JsValue as a JsObject,
     * so you can call insert() with this JsValue.
     * (insert() takes a JsObject as parameter, or anything that can be
     * turned into a JsObject using a Writes.)
     */
    request.body.validate[ItineraryRecord].map { itinerary =>
      // `user` is an instance of the case class `models.User`
      Logger.debug("insert itinerary: " + itinerary)
      collection.insert(itinerary).map { lastError =>
        Logger.debug(s"Successfully inserted with LastError: $lastError")
        itinerary.partners.foreach({ ps =>
          ps.foreach({ p =>
            val topic = p + "/" + itinerary.user + "/addItinerary"
            Logger.debug("publish on topic(" + topic + ")")
            Chat.publishOnTopic( topic, "new itinerary", 2 )
          })
        })

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

  def getItineraryByUser(user: String) = Action.async {
    Logger.debug("getItineraryByUser: " + user)

    val cursor: Cursor[ItineraryRecord] = collection.
      // {"$or":[ { "user":user }, { "partners":{ $in:[user] } } ]}
      find(Json.obj("$or" ->  Json.arr( Json.obj( "user" -> user ), Json.obj("partners" -> Json.obj( "$in" -> Json.arr(user) ) ) ) )).
      sort(Json.obj("start" -> 1)).
      cursor[ItineraryRecord]

    val futureItineraryList: Future[List[ItineraryRecord]] = cursor.collect[List]()
    futureItineraryList.map { i =>
      // convert scala list to json array
      Ok(JsObject("itineraries"->Json.toJson(i)::Nil))
    }
  }

}
