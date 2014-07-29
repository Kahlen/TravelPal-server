$(document).ready( function() {
    setCreateCommentBtn();
    replaceLineBreak();
    makeComment();
});

function replaceLineBreak() {

    $(".trip_content_feed").each(function(){
        var content = $(this).html();
        // replace /n to <br> for existing comments
        content = nl2br(content);
        $(this).html(content);
    });

}

function setCreateCommentBtn() {
    $('.trip_content_container button').click( function () {
        var rawInput = $('#trip_comment').val();
        var inputComment = nl2br(rawInput);
        $('#trip_comment').val('');
        $('.trip_content_comment_area').prepend('<div class="trip_content_comments"><h5>' + getCookie("userName") + " (" + getCookie("userId") + ")" + '</h5><p class="trip_content_feed">' + inputComment + '</p><div class="fav_listings_comments_section"><form class="trip_content_comment_textarea"><div class="fav_comment"><textarea class="fav_comment_textarea" placeholder="Write a comment..." maxlength=1000></textarea></div></form></div></div>');
        makeComment();
        // post to server
        var iid = localStorage.getItem('iid');
        // replace line break to /n when posting to server
        postItineraryDetail2Server(iid, nl2nl(rawInput));
    });
}

function postItineraryDetail2Server(iid, feed) {
    var timestamp = new Date().getTime();
    var requestBody = '{"_id":"' + iid + '","data":{"user":' + getUserDataJson() + ',"feed":"' + feed + '", "timestamp":' + timestamp + '}}';
    console.log("requestBody: " + requestBody);
    $.ajax({url: '/updateitinerary',
        data: requestBody,
        type: 'POST',
        async: 'true',
        dataType: 'application/json',
        contentType: 'application/json',
        complete: function(xhr, statusText) {
            // This callback function will trigger on data sent/received complete
            console.log("update itinerary complete: " + xhr.status);
        },
        error: function (xhr, statusText, err) {
            // This callback function will trigger on unsuccessful action
            console.log("update itinerary error: " + xhr.status);
        }
    });
}

function makeComment() {
    $('.fav_comment_textarea').each(function(){
        $(this).keypress(function(e){
          if(e.keyCode == 13) {
            var comment = $(this).val();
            if ( comment.length === 0 )
                return false;
            // user pressed enter
            var timestamp = new Date().getTime();
            $(this).parent().before('<div class="fav_comment"><div class="fav_comment_text">' + getCookie("userName") + " (" + getCookie("userId") + "): " + comment + '</div><div class="fav_comment_time">' + timeConverter(timestamp) + '</div></div>');
            $(this).val('');
            return false;
          }
        });
    });
}

// convert line breaks to <br>
function nl2br (str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}

function nl2nl(str, is_xhtml) {
    return str.replace(/(?:\r\n|\r|\n)/g, '\\n');
}

// convert timestamp to Date format
function timeConverter(unix_timestamp){
    var a = new Date(unix_timestamp);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth() - 1];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = hour + ':' + min + ':' + sec + '  ' + date + ' ' + month + ' ' + year;
    return time;
 }