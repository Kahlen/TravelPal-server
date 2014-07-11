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
                $('#friendsList .list').append('<li><h3 class="name">User: '+ user._id +'</h3></li>');
              });
        }

    });

//    $.get( "searchf", function( data ) {
//    console.log("data: " + data);
//    var friends = data.friends;
//      $.each(friends, function(index,userName) {
//          $('#friendsList .list').append('<li><h3 class="name">'+userName+'</h3></li>');
//        });
//    }, "json" );

}

function update_list(updatedUsers) {

  $.each(updatedUsers, function(index,userName) {
    $('#friendsList .list').append('<li><h3 class="name">'+userName+'</h3></li>');
  });

}