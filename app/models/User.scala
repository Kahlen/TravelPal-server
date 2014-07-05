package models

/**
 * Created by kahlenlin on 7/5/14.
 */
case class User(id: String, password: String, name: String)

object JsonFormats {
  import play.api.libs.json.Json
  import play.api.data._
  import play.api.data.Forms._

  // Generates Writes and Reads for Feed and User thanks to Json Macros
  implicit val userFormat = Json.format[User]
}