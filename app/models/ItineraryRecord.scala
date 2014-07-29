package models

/**
 * Created by kahlenlin on 7/20/14.
 */
case class ItineraryRecord (_id: String, user: String, destination: String, start: String, end: String, partners: Option[List[String]])
case class IteneraryComment(user: User, comment: String)
case class ItineraryDetail(_id: String, data: Option[List[IteneraryComment]])


object ItineraryJsonFormats {
  import play.api.libs.json.Json
  import play.api.data._
  import play.api.data.Forms._
  import JsonFormats._

  implicit val itineraryFormat = Json.format[ItineraryRecord]
  implicit val itineraryCommentFormat = Json.format[IteneraryComment]
  implicit val itineraryDetailFormat = Json.format[ItineraryDetail]
}
