package models

/**
 * Created by kahlenlin on 7/20/14.
 */
case class ItineraryRecord (_id: String, user: String, destination: String, start: String, end: String, partners: Option[List[String]])

object ItineraryJsonFormats {
  import play.api.libs.json.Json
  import play.api.data._
  import play.api.data.Forms._

  implicit val itineraryFormat = Json.format[ItineraryRecord]
}
