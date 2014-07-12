package models

import play.api.libs.json.JsObject

/**
 * Created by kahlenlin on 7/5/14.
 */
case class User(_id: String, password: String, name: String) {
  var friendsList: List[String] = _
  var friendsJson: JsObject = _
}

object JsonFormats {
  import play.api.libs.json.Json
  import play.api.data._
  import play.api.data.Forms._

  implicit val userFormat = Json.format[User]
  implicit val friendsOfFormat = Json.format[FriendsOf]
}

case class FriendsOf(_id: String, password: String, name: String, friends: Option[List[String]])