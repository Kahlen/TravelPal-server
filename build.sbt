name := """TravelPal"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.1"

resolvers ++= Seq(
  "Eclipse Paho" at "https://repo.eclipse.org/content/repositories/paho-releases/",
  "GCM Server Repository" at "https://raw.github.com/slorber/gcm-server-repository/master/releases/",
  "Sonatype Snapshots" at "https://oss.sonatype.org/content/repositories/snapshots/"
)

libraryDependencies ++= Seq(
  jdbc,
  anorm,
  cache,
  ws,
  "org.eclipse.paho"    %   "mqtt-client"    % "0.4.0",
  "org.mongodb" % "mongo-java-driver" % "2.8.0",
  "org.reactivemongo" %% "play2-reactivemongo" % "0.11.0-SNAPSHOT",
  "com.google.android.gcm" % "gcm-server" % "1.0.2"
)
