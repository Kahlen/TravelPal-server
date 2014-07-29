$(document).ready( function() {
    setCreateCommentBtn();
});

function setCreateCommentBtn() {
    $('.trip_content_container button').click( function () {
        var inputComment = nl2br($('#trip_comment').val());
        $('#trip_comment').val('');
        $('.trip_content_comment_area').prepend('<div class="trip_content_comments"><h5>' + getCookie("userId") + '</h5><p>' + inputComment + '</p></div>');

        // post to server
        var iid = localStorage.getItem('iid');
        postItineraryDetail2Server(iid, inputComment);
    });
}

function postItineraryDetail2Server(iid, comment) {
    var requestBody = '{"_id":"' + iid + '","data":{"user":' + getUserDataJson() + ',"comment":"' + comment + '"}}';
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

//function addExistingComments(data) {
//    $.each(data, function(index, value){
//        $('.trip_content_comment_area').prepend('<div class="trip_content_comments"><h5>' + getCookie("userId") + '</h5><p>' + inputComment + '</p></div>');
//    });
//}

// convert line breaks to <br>
function nl2br (str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}