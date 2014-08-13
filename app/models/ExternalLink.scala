package models

/**
 * Created by kahlenlin on 8/12/14.
 */
case class ExternalLink(title: String, description: String, image: String, url: String)

object ExternalLinkJsonFormats {
  import play.api.libs.json.Json
  import play.api.data._
  import play.api.data.Forms._

  implicit val linkFormat = Json.format[ExternalLink]

}