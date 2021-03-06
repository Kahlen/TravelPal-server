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
import models.User

// Reactive Mongo imports
import reactivemongo.api._
import reactivemongo.core.errors.DatabaseException

import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import play.api.data.Form
import models._
import models.JsonFormats._

/**
 * Created by kahlenlin on 7/5/14.
 */
object Users extends Controller with MongoController {

  def collection: JSONCollection = db.collection[JSONCollection]("users")


  // http://localhost:9000/user?id=testid&password=testid&name=testid
  def create(id: String, password: String, name: String) = Action.async {
    Logger.debug("create user:")
    val user = User(id, password, name)
    // insert the user


    val futureResult = collection.insert(user)
    // when the insert is performed, send a OK 200 result
    futureResult.map { lastError =>
      // successfully insert
      Ok
    } recover {
      // insert error
      case e: DatabaseException =>
        Logger.debug("error insert user: " + e.getMessage)
        e.printStackTrace()
        if ( e.code.getOrElse(0) == 11000 ) {
          // handle duplicated user id here
          Logger.debug("duplicate user id")
        }
        Ok
      case e: Exception =>
        e.printStackTrace()
        Ok
    }
  }

  def createFromJson = Action.async(parse.json) { request =>
    /*
     * request.body is a JsValue.
     * There is an implicit Writes that turns this JsValue as a JsObject,
     * so you can call insert() with this JsValue.
     * (insert() takes a JsObject as parameter, or anything that can be
     * turned into a JsObject using a Writes.)
     */
    request.body.validate[User].map { user =>
      // `user` is an instance of the case class `models.User`
      collection.insert(user).map { lastError =>
        Logger.debug(s"Successfully inserted with LastError: $lastError")
        // subscribe everything about this id
        Chat.subscribeEverythingOnId(user._id)
        Created(Json.toJson(user))
      } recover {
        // insert error
        case e: DatabaseException =>
          Logger.debug("error insert user: " + e.getMessage)
          e.printStackTrace()
          if ( e.code.getOrElse(0) == 11000 ) {
            // handle duplicated user id here
            Logger.debug("duplicate user id")
          }
          NotAcceptable("user already exist")
        case e: Exception =>
          e.printStackTrace()
          InternalServerError
      }
    }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  def loginFromJson = Action.async(parse.json) { request =>
    /*
     * request.body is a JsValue.
     * There is an implicit Writes that turns this JsValue as a JsObject,
     * so you can call insert() with this JsValue.
     * (insert() takes a JsObject as parameter, or anything that can be
     * turned into a JsObject using a Writes.)
     */

    request.body.validate[User].map { user =>
      // `user` is an instance of the case class `models.User`
      // let's do our query
      Logger.debug("request = " + user)

      val cursor: Cursor[User] = collection.
        // find all people with name `name`
        find(Json.obj("_id" -> user._id, "password" -> user.password)).
        // sort them by creation date
        sort(Json.obj("created" -> -1)).
        // perform the query and get a cursor of JsObject
        cursor[User]

      // gather all the JsObjects in a list
      val futureUsersList: Future[List[User]] = cursor.collect[List]()

      // everything's ok! Let's reply with the array
      futureUsersList.map { persons =>
        if (persons.isEmpty) {
          NotFound("user not found")
        } else {
          Chat.subscribeEverythingOnId(user._id)
          Logger.debug("--- subscribe everything after login")
          Ok(Json.toJson(persons(0)))
        }
      }
    }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  def findFriends() = Action.async {
    // let's do our query
    val cursor: Cursor[User] = collection.
      // find all people with name `name`
      find(Json.obj()).
      // sort them by creation date
      sort(Json.obj("_id" -> 1)).
      // perform the query and get a cursor of JsObject
      cursor[User]

    // gather all the JsObjects in a list
    val futureUsersList: Future[List[User]] = cursor.collect[List]()

    // transform the list into a JsArray
    val futurePersonsJsonArray: Future[JsArray] = futureUsersList.map { persons =>
      Logger.debug("persons: " + persons)
      Json.arr(persons)
    }

    // everything's ok! Let's reply with the array
    futurePersonsJsonArray.map { persons =>
      Logger.debug("findFrineds: " + persons)
      // return json value
      Ok(JsObject("friends" -> persons::Nil))
    }
  }

  def findFriendsWithRelation(id: String) = Action.async {
    // let's do our query
    val cursor: Cursor[FriendsOf] = collection.
      // find all people with name `name`
      find(Json.obj()).
      // sort them by creation date
      sort(Json.obj("_id" -> -1)).
      // perform the query and get a cursor of JsObject
      cursor[FriendsOf]

    // gather all the JsObjects in a list
    val futureUsersList: Future[List[FriendsOf]] = cursor.collect[List]()


    // transform the list into a JsArray
    val futurePersonsJsonArray: Future[JsArray] = futureUsersList.map { persons =>
      Logger.debug("persons: " + persons)

      var isFriendResult: JsArray = JsArray()
      var notFriendResult: JsArray = JsArray()
      persons.foreach{ p =>
        p match {
          case FriendsOf(fid,_,name,x) =>
            if ( !fid.equals(id) ) {
              // show all the ids except current user
              Logger.debug("id: " + fid)
              val isFriend = x match {
                case None => false
                case Some(i) => i.contains(id)
              }
              val tmp = Json.obj(
                "_id" -> fid,
                "name" -> name,
                "isFriend" -> isFriend
              )
              if ( isFriend )
                isFriendResult = tmp +: isFriendResult
              else
                notFriendResult = tmp +: notFriendResult

            }
        }
      }

      // friends are listed before not friends
      isFriendResult ++ notFriendResult
    }

    // everything's ok! Let's reply with the array
    futurePersonsJsonArray.map { persons =>
      Logger.debug("findFrineds: " + persons)
      // return json value
      Ok(JsObject("friends" -> persons::Nil))
    }
  }

  def findFriendsWithFriend(id: String) = Action.async {
    val cursor: Cursor[FriendsOf] = collection.
      // find all people with name `name`
      find(Json.obj( "friends" -> id )).
      // sort them by creation date
      sort(Json.obj("_id" -> 1)).
      // perform the query and get a cursor of JsObject
      cursor[FriendsOf]

    // gather all the JsObjects in a list
    val futureUsersList: Future[List[FriendsOf]] = cursor.collect[List]()

    // transform the list into a JsArray
    val futurePersonsJsonArray: Future[JsArray] = futureUsersList.map { persons =>
      Logger.debug("persons: " + persons)

      var friendsResult: JsArray = JsArray()
      persons.foreach{ p =>
        p match {
          case FriendsOf(fid,_,name,_) =>
            // show all the ids except current user
            Logger.debug("id: " + fid + ", name: " + name)
            val tmp = Json.obj(
              "_id" -> fid,
              "name" -> name
            )

            friendsResult = tmp +: friendsResult
        }
      }

      friendsResult
    }

    // everything's ok! Let's reply with the array
    futurePersonsJsonArray.map { persons =>
      Logger.debug("findFriendsWithFriend: " + persons)
      // return json value
      Ok(JsObject("friends" -> persons::Nil))
    }

  }

  def findUserById(id: String) = Action.async {
    // let's do our query
    val cursor: Cursor[User] = collection.
      // find all people with name `name`
      find(Json.obj("_id" -> id)).
      // sort them by creation date
      sort(Json.obj("created" -> -1)).
      // perform the query and get a cursor of JsObject
      cursor[User]

    // gather all the JsObjects in a list
    val futureUsersList: Future[List[User]] = cursor.collect[List]()

    // everything's ok! Let's reply with the array
    futureUsersList.map { persons =>
      Ok(persons.toString)
    }
  }

  implicit val friendRequestJson2Obj = (
    (__ \ 'id).read[String] and
      (__ \ 'friend).read[String]
    ) tupled

  def addFriends = Action { request =>
    Logger.debug("addFriends")
    request.body.asJson.map { json =>
      json.validate[(String, String)].map{
        case (id, friend) =>
          // add friends to database
          Logger.debug("friend: " + friend)
          collection.update(Json.obj("_id" -> id), Json.obj("$push" -> Json.obj("friends" -> friend)))
          collection.update(Json.obj("_id" -> friend), Json.obj("$push" -> Json.obj("friends" -> id)))
          val topic = friend + "/" + id + "/addFriend"
          Chat.publishOnTopic(topic, "addFriend", 0)
          Ok
      }.recoverTotal{
        e => BadRequest("Detected error:"+ JsError.toFlatJson(e))
      }
    }.getOrElse {
      BadRequest("Expecting Json data")
    }
  }

  def removeFriends = Action { request =>
    Logger.debug("removeFriends")
    request.body.asJson.map { json =>
      json.validate[(String, String)].map{
        case (id, friend) =>
          // add friends to database
          Logger.debug("friend: " + friend)
          collection.update(Json.obj("_id" -> id), Json.obj("$pull" -> Json.obj("friends" -> friend)))
          collection.update(Json.obj("_id" -> friend), Json.obj("$pull" -> Json.obj("friends" -> id)))
          Ok
      }.recoverTotal{
        e => BadRequest("Detected error:"+ JsError.toFlatJson(e))
      }
    }.getOrElse {
      BadRequest("Expecting Json data")
    }
  }

}
