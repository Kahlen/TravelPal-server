package models

import play.api.libs.json.JsObject


/**
 * Created by kahlenlin on 7/14/14.
 */
case class ChatHistory (
  from: String,
  to: String,
  history: List[ChatRecord])

object ChatHistoryJsonFormats {
  import play.api.libs.json.Json
  import play.api.data._
  import play.api.data.Forms._

  implicit val recordFormat = Json.format[ChatRecord]
  implicit val historyFormat = Json.format[ChatHistory]

}

case class ChatRecord(message: String, timestamp: String)