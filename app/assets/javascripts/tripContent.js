$(document).ready( function() {
    setCreateCommentBtn();
    replaceLineBreak();
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
        $('.trip_content_comment_area').prepend('<div class="trip_content_comments"><h5>' + getCookie("userName") + " (" + getCookie("userId") + ")" + '</h5><p class="trip_content_feed">' + inputComment + '</p></div>');

        // post to server
        var iid = localStorage.getItem('iid');
        // replace line break to /n when posting to server
        postItineraryDetail2Server(iid, nl2nl(rawInput));
    });
}

function postItineraryDetail2Server(iid, comment) {
    var timestamp = new Date().getTime();
    var requestBody = '{"_id":"' + iid + '","data":{"user":' + getUserDataJson() + ',"comment":"' + comment + '", "timestamp":' + timestamp + '}}';
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

// convert line breaks to <br>
function nl2br (str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}

function nl2nl(str, is_xhtml) {
    return str.replace(/(?:\r\n|\r|\n)/g, '\\n');
}