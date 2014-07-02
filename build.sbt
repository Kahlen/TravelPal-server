name := """TravelPal"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.1"

resolvers ++= Seq(
  "Eclipse Paho" at "https://repo.eclipse.org/content/repositories/paho-releases/"
)

libraryDependencies ++= Seq(
  jdbc,
  anorm,
  cache,
  ws,
  "org.eclipse.paho"    %   "mqtt-client"    % "0.4.0"
)
