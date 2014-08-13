package controllers

import play.api.mvc.{Action, Controller}

/**
 * Created by kahlenlin on 7/11/14.
 */
object ContentManager extends Controller {

  def index = Action {
    Ok(views.html.front("Hello, world"))
  }

  def friends = Action {
    Ok(views.html.friends("Hello, world"))
  }

  def mytrip = Action {
    Ok(views.html.mytrip("Hello, word"))
  }

  def newtrip = Action {
    Ok(views.html.newtrip("Hello, word"))
  }

  def promote = Action {
    Ok(views.html.promote("Hello, word"))
  }

}
