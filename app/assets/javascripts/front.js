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

    logout();

	setupBtn("#homeBtn", "#idont");
	setupBtn("#myTripsBtn","mytrip");
	setupBtn("#newTripsBtn","newtrip");
	setupBtn("#findFriendsBtn","friends");
//	setupBtn("#meBtn","#about");


}


function logout() {

    $("#meBtn").click(function() {
        console.log("logout clicked");
        // remove cookie
        deleteCookie("userId");
        // go to index page
        window.location.href = "/";
    });

}

function deleteCookie(name) {
    document.cookie = name+'="";-1; path=/';
}

