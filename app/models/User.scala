package models

/**
 * Created by kahlenlin on 7/5/14.
 */
case class User(_id: String, password: String, name: String)

object JsonFormats {
  import play.api.libs.json.Json
  import play.api.data._
  import play.api.data.Forms._

  implicit val userFormat = Json.format[User]
}