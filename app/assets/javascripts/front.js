$(document).ready( function() {
    var user = $.cookie("userId");
    console.log("user = " + user);
    setupPage();
});

function setupBtn(btn, tag) {
    $(btn).click(function() {
    console.log(tag + " clicked");
      $('#content').load(tag, function() {
              $(this).trigger('create');
          });
    });
}

function setupPage() {
	setupBtn("#homeBtn", "#idont");
	setupBtn("#myTripsBtn","#luck");
	setupBtn("#newTripsBtn","#paint");
	setupBtn("#findFriendsBtn","friends");
	setupBtn("#meBtn","#about");
}
