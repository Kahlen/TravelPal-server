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


  def detailCollection: JSONCollection = db.collection[JSONCollection]("itineraryDetail")
  def getItineraryByIid(iid: String) = Action.async {
    Logger.debug("getItineraryByIid: " + iid)

    val cursor: Cursor[ItineraryDetail] = detailCollection.
      // {"$or":[ { "user":user }, { "partners":{ $in:[user] } } ]}
      find(Json.obj("_id" -> iid)).
      cursor[ItineraryDetail]

    val futureItineraryList: Future[List[ItineraryDetail]] = cursor.collect[List]()
    futureItineraryList.map { i =>
      // convert scala list to json array
      if ( i.size > 0 ) {
        var iti = i(0)
        // reverse the order of comments (from new to old)
        val result = ItineraryDetail(iti._id, iti.data.map{ comment => comment.reverse })
        Ok(views.html.tripContent(result))
      } else {
        Ok(views.html.tripContent(ItineraryDetail(iid, None)))
      }
    }

  }

  implicit val uItineraryRequestJson2Obj = (
    (__ \ '_id).read[String] and
      (__ \ 'data).read[IteneraryComment]
    ) tupled

  def updateItinerary = Action { request =>
    Logger.debug("update itinerary post: " + request)

    request.body.asJson.map { json =>
      json.validate[(String, IteneraryComment)].map{
        case (_id, data) =>
          // add friends to database
          Logger.debug("data: " + data)
          detailCollection.update(
            Json.obj("_id" -> _id),
            Json.obj("$push" -> Json.obj("data" -> data)),
            upsert = true)
          Ok
      }.recoverTotal{
        e => BadRequest("Detected error:"+ JsError.toFlatJson(e))
      }
    }.getOrElse {
      BadRequest("Expecting Json data: " + request)
    }
  }

}
