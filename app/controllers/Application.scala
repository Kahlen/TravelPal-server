package controllers

import play.api._
import play.api.mvc._
import play.mvc.Http

object Application extends Controller {

  def index = Action { request =>
    request.cookies.get("userId") match {
      case None =>
        Ok(views.html.index("Hello, world"))
      case Some(x) =>
        val userId = x.value
        Logger.debug("userId = " + userId)
        if ( userId == null || userId.isEmpty || userId.equals("null"))
          Ok(views.html.index("Hello, world"))
        else
          Ok(views.html.front("Hello, world"))
    }

  }

}