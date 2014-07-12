$(document).ready( function() {
    var user = $.cookie("userId");
    console.log("user = " + user);

//    var updated_users = ["name1", "name2", "name3"];
//    update_list(updated_users);

    getFriends();
});

function getFriends() {

    $.ajax({
        type: 'GET',
        url: '/searchf',
        dataType: 'json',
        success: function (data) {
            console.log("data: " + data);
            var friends = data.friends[0];
            $.each(friends, function(index,user) {
                var item = $("<li class='me' style='display: none;'>" + user._id + "<i class='icon-minus pull-right'></i></li>");
                $("#removeList").append(item);
                $("#removeList").find("li.me:last-child").slideDown();
                friendClick();
//                $('#friendsList .list').append('<li><h3 class="name">User: '+ user._id +'</h3></li>');
              });
        }

    });

}

function friendClick() {

    //removing from list
    $("ul").on("click", "li", function(event) {
      $(this).find("i").addClass("icon-rotate-90");
      // change background color
      $(this).toggleClass("pressed");

      var user = $(this).text(); // user id
      console.log(user + " clicked");

      return false;
    });


}