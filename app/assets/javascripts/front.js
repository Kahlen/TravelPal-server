$(document).ready( function() {
    var user = $.cookie("userId");
    console.log("user = " + user);
    setupPage();
});

function setupBtn(btn, tag) {
    $(btn).click(function() {
    console.log(tag + " clicked");

      $('ul li a').each(function(i) {
         if ($(this).hasClass('active') ) {
              //toggle other tab to non-active if it was previously active
              $(this).removeClass('active');
         }
      });

      $(btn).addClass('active');

      $('#content').load(tag, function() {
              $(this).trigger('create');
          });

      return false;
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

    // put username at upper right
    $("#userPlace").text( getCookie("userId") );

    $("#userPlace").click(function() {
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

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
    }
    return "";
}

