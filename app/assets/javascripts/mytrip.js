var itineraries;

$(document).ready(function() {
    getItineraries();
});

function getItineraries() {
    var user = getCookie("userId");

    $.ajax({
        type: 'GET',
        url: '/itinerary',
        data: {"user": user},
        dataType: 'json',
        success: function (data) {
            console.log("getItineraryByUser: " + data);
            // json array
            itineraries = data.itineraries;
            $.each(itineraries, function(index,record) {
                var item = $("<a class='mytrip_item' id='" + record._id + "'><span class='destination'>" + record.destination + "</span><span class='date'>" + record.start + " ~ " + record.end + "</span></a>");
                $(".mytrip_list").append(item);
              });

            setItineraryItemClick();
        }

    });
}

function setItineraryItemClick() {

    $(".mytrip_list").off().on("click", ".mytrip_item", function(event) {
        var currentId = $(this).attr('id');
        console.log("_id(" + currentId + ") is clicked");

        var destination = $(this).find('.destination').text();
        var date = $(this).find('.date').text();
//        var clickedIndex = $(this).index();
//        var partners = itineraries[clickedIndex].partners;

        // get itinerary content
        $.get( "/getitinerary?iid=" + currentId, function(data) {
            localStorage.setItem('iid', currentId);
            localStorage.setItem('destination', destination);
            localStorage.setItem('date', date);
//            localStorage.setItem('partners', partners);
            $('#content').html(data);
        });

    });

}