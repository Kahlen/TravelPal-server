package models

/**
 * Created by kahlenlin on 7/20/14.
 */
case class ItineraryRecord (_id: String, user: String, destination: String, start: String, end: String, partners: Option[List[String]])
case class IteneraryFeed(user: User, feed: String, timestamp: Long)
case class ItineraryDetail(_id: String, data: Option[List[IteneraryFeed]])


object ItineraryJsonFormats {
  import play.api.libs.json.Json
  import play.api.data._
  import play.api.data.Forms._
  import JsonFormats._

  implicit val itineraryFormat = Json.format[ItineraryRecord]
  implicit val itineraryFeedFormat = Json.format[IteneraryFeed]
  implicit val itineraryDetailFormat = Json.format[ItineraryDetail]
}
