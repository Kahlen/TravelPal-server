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

      if ( tag == "newtrip" ) {
          console.log("add head");
          var link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'http://code.jquery.com/ui/1.10.2/themes/smoothness/jquery-ui.css';
          document.getElementsByTagName('head')[0].appendChild(link);

          var script = document.createElement('script');
          script.src = 'http://code.jquery.com/ui/1.10.2/jquery-ui.js';
          document.getElementsByTagName('head')[0].appendChild(script);
          setTimeout( loadContentPage(tag), 5000 );
      } else {
        loadContentPage(tag);
      }

      return false;
    });
}

function loadContentPage(tag) {
    $('#content').load(tag, function() {
       $(this).trigger('create');
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

