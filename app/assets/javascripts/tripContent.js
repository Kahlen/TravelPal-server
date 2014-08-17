$(document).ready( function() {
    putTitle();
    processExistingLinks();
    setCreateCommentBtn();
    replaceLineBreak();
    makeComment();
});

function processExistingLinks() {

    // for the existing feeds, if it's a link, change the format
    $('.trip_content_comment_area').children('.trip_content_comments').each(function(index) {
         // process external link
         var content = $(this).find('.trip_content_feed');
         var foundFeed = content.text();
         if( foundFeed.indexOf("http://") >= 0 || foundFeed.indexOf("https://") >= 0 ){
             console.log("foundFeed: " + foundFeed);
             processExternalLink(foundFeed, index);
         } else {
            // if feed is not a link, change feed to editable
            var postUser = $(this).find('h5').text();
            if ( postUser.substring(postUser.lastIndexOf("(")+1,postUser.lastIndexOf(")")) === $.cookie("userId") ) {
                // make feed editable
                content.attr('contenteditable', true);
            }
         }
    });
}

function putTitle() {
    $('.mainBlock').text(localStorage.getItem('destination'));
    $('.padBlock').text(localStorage.getItem('date'));
}

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
        var timestamp = new Date().getTime();
        var timeS = timeConverter(timestamp);
        $('.trip_content_comment_area').prepend('<div class="trip_content_comments"><h5>' + getCookie("userName") + " (" + getCookie("userId") + ")" + '</h5><p class="trip_content_feed">' + inputComment + '</p><p class="trip_content_feed_timestamp">' + timeS + '</p><div class="fav_listings_comments_section"><form class="trip_content_comment_textarea"><div class="fav_comment"><textarea class="fav_comment_textarea" placeholder="Write a comment..." maxlength=1000></textarea></div></form></div></div>');
        makeComment();
        // post to server
        var iid = localStorage.getItem('iid');
        // replace line break to /n when posting to server
        postItineraryDetail2Server(iid, nl2nl(rawInput), timeS);

        processExternalLink(rawInput, 0);
    });
}

function processExternalLink(links, replaceIndex) {

    if ( (links.lastIndexOf("http://", 0) === 0) || (links.lastIndexOf("https://", 0) === 0) ) {
        // start with http:// or https://
        // get request
        $.ajax({url: '/processlink',
            data: links,
            type: 'POST',
            async: 'true',
            dataType: 'application/json',
            contentType: 'text/plain',
            success: function (response) {
               console.log(response);
//               console.log("title: " + response.title + ", description: " + response.description + ", image: " + response.image );
            },
            error: function (response) {
               var data = $.parseJSON(response.responseText);
//               console.log("data: " + response.responseText);
               console.log("title: " + data.title + ", description: " + data.description + ", image: " + data.image );
               /*

               <div class="trip_content_comments">
                   <h5>Username here</h5>
                   <div class="link_container">
                       <div class="link_right">
                           <p class="link_title">Title</p>
                           <p class="link_description">description</p>
                       </div>
                       <div class="link_left">
                           <img src="http://i2.cdn.turner.com/cnn/dam/assets/140110101028-10-things-taiwan-1-story-top.jpg" />
                       </div>
                   </div>
                   <form class="trip_content_comment_textarea">
                       <div class='fav_comment'>
                           <textarea class='fav_comment_textarea' placeholder='Write a comment...' maxlength=1000></textarea>
                       </div>
                   </form>
               </div>

               */


               // only replace the link tex if the title is not empty
               if ( data.title.trim() ) {
                    // remove the link text
                    $('.trip_content_comment_area').children().eq(replaceIndex).find('.trip_content_feed').remove();
                    // add new format
                    $('.trip_content_comment_area').children().eq(replaceIndex).find('h5').after('<div class="link_container"><div class="link_right"><p class="link_title">' + data.title + '</p><p class="link_description">' + data.description + '</p></div><div class="link_left"><img src="' + data.image + '"/></div></div>');
                    // add href link
                    $('.trip_content_comment_area').children().eq(replaceIndex).find('.link_container').wrap('<a href="' + data.url + '" target="_blank" style="text-decoration: none"></a>');

               }
            }
        });

    }

}

function postItineraryDetail2Server(iid, feed, timestamp) {
    var requestBody = '{"_id":"' + iid + '","data":{"user":' + getUserDataJson() + ',"feed":"' + feed + '", "timestamp":"' + timestamp + '"}}';
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

            // array order is reverse in database, so feedIndex should be length-index-1
            var feedIndex =  $('.trip_content_comment_area').children().length - $(this).closest('.trip_content_comments').index() -1;
            console.log("feedIndex: " + feedIndex);
            var requestBody = '{"_id":"' + localStorage.getItem('iid') + '","index":' + feedIndex + ',"data":{"user":' + getUserDataJson() +',"comment":"' + comment + '","timestamp":"' + timeConverter(timestamp) + '"}}';
            console.log("requestBody: " + requestBody);
            $.ajax({url: '/itinerarycomment',
                data: requestBody,
                type: 'POST',
                async: 'true',
                dataType: 'application/json',
                contentType: 'application/json',
                complete: function(xhr, statusText) {
                    // This callback function will trigger on data sent/received complete
                    console.log("comment itinerary complete: " + xhr.status);
                },
                error: function (xhr, statusText, err) {
                    // This callback function will trigger on unsuccessful action
                    console.log("comment itinerary error: " + xhr.status);
                }
            });

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