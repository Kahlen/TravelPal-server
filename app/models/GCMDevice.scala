package models

/**
 * Created by kahlenlin on 8/6/14.
 */
case class GCMDevice(_id: String, registrationId: String)
case class GCMNotification(message: String, collapseKey: Option[String]) {
  import com.google.android.gcm.server.Message
  def asMessage: Message = {
    val messageBuilder = new Message.Builder()
    messageBuilder.addData("message", message)
    if (collapseKey.isDefined) {
      messageBuilder.collapseKey(collapseKey.get)
    }
    messageBuilder.build()
  }
}

object GCMDeviceJsonFormats {
  import play.api.libs.json.Json
  import play.api.data._
  import play.api.data.Forms._

  implicit val deviceFormat = Json.format[GCMDevice]
  implicit val notificationFormat = Json.format[GCMNotification]
}