/**
 * Scripts for the booking widget.
 */
 var destination = "";

$(document).ready(function() {
    console.log("newtrip ready");
	setupDatepicker();
	setCreateBtn();
	setBackOkBtn();
    getUsersFriends();
});

function setupDatepicker() {

	$("#check-in, #check-out").each(function() {
		$(this).replaceWith(
			this.outerHTML
				.replace('type="date"', 'type="text"')
				.replace(/name="(\w+)"/, '')
		);
	});
    console.log("new trip ready");
	$("#check-out").datepicker({
		buttonImage: "http://d3pot.com/~ntieman/hiltonamericashouston.com/images/calendar.gif",
		buttonImageOnly: true,
		minDate: 0,
		maxDate: "+90",
		showOn: "both",
		dateFormat: 'dd/mm/yy',
        inline: true,
        altField: '#check-out'
	});
    console.log("new trip ready2");
	$("#check-in").datepicker({
        buttonImage: "http://d3pot.com/~ntieman/hiltonamericashouston.com/images/calendar.gif",
        buttonImageOnly: true,
        minDate: 0,
        maxDate: "+89",
        showOn: "both",
        dateFormat: 'dd/mm/yy',
        inline: true,
        altField: '#check-in',
        onSelect: function(dateText, inst){
            var arrival = $('#check-in').datepicker('getDate').getTime();

            var dayMilliseconds = 24 * 60 * 60 * 1000;
            var departure = new Date(arrival + dayMilliseconds);
            var $checkOut = $("#check-out");

            $checkOut.datepicker("option", "minDate", departure);
            $checkOut.datepicker("setDate", departure);
            $checkOut.change();

            return false;
        }
    });

	$("#check-in").datepicker("setDate", new Date());
	$("#check-in").change();
	$("#check-out").datepicker("setDate", new Date());
	$("#check-out").change();

}

function setCreateBtn() {
    $('#check-rates').click( function() {
        destination = $('#destination').val();
        var startDate = $('#check-in').val();
        var endDate = $('#check-out').val();
        console.log("destination: " + destination + ", " + startDate + " ~ " + endDate);
        // TODO: create trip on server

        // pass destination and time to friends list page
        $('.newtrip-destination-title').text(destination);
        setSelectedDateIcon( ".time-icon-start", $('#check-in').datepicker('getDate') );
        setSelectedDateIcon( ".time-icon-end", $('#check-out').datepicker('getDate') );

        // slide to friend list
        $('.newtrip-container').toggleClass('slide');
    });
}

function setSelectedDateIcon( tag, startDate ) {

      var month=[];
      month[0]="January";
      month[1]="February";
      month[2]="March";
      month[3]="April";
      month[4]="May";
      month[5]="June";
      month[6]="July";
      month[7]="August";
      month[8]="September";
      month[9]="October";
      month[10]="November";
      month[11]="December";
    //--------------------------

    //Set icon text with the date data
    $( tag + " strong").html(month[startDate.getMonth()]);
    $( tag + ' span').text(startDate.getDate());
    $( tag + ' em').text(startDate.getFullYear());
}

function setBackOkBtn() {
    $('#back-button').click(function(){
        $('.newtrip-container').toggleClass('slide');
    });
    $('#ok-button').click(function(){
        // TODO: save friend list to server


        var partnerJsonObj = [];
        $('ul li').each(function(i) {
           if ($(this).is('.me.pressed')) {
                //toggle other tab to non-active if it was previously active
                var partner = $(this).text();
                partnerJsonObj.push(partner);
           }
        });

        var requestBody = "";
        if ( partnerJsonObj.length === 0 ) {
            requestBody += '{"_id":"' +createGuid() + '","user":"' + getCookie("userId") + '","destination":"' + destination + '","start":"' + $("#check-in").val() + '","end":"' + $("#check-out").val() + '"}';
        } else {
            requestBody = '{"_id":"' +createGuid() + '","user":"' + getCookie("userId") + '","destination":"' + destination + '","start":"' + $("#check-in").val() + '","end":"' + $("#check-out").val() + '","partners":[';
            $.each(partnerJsonObj, function(index, value){
                requestBody += '"' + value + '",';
            });
            requestBody = requestBody.substring(0, requestBody.length-1);
            requestBody += ']}';
        }


        console.log("requestBody: " + requestBody);

        $.ajax({url: '/additinerary',
            data: requestBody,
            type: 'POST',
            async: 'true',
            dataType: 'application/json',
            contentType: 'application/json',
            complete: function(xhr, statusText) {
                // This callback function will trigger on data sent/received complete
                console.log("login complete: " + xhr.status);
            },
            error: function (xhr, statusText, err) {
                // This callback function will trigger on unsuccessful action
                console.log("login error: " + xhr.status);
            }
        });
        console.log("ok clicked");

        $('#myTripsBtn').trigger('click');
        return false;

    });
}

function getUsersFriends() {

    $.ajax({
        type: 'GET',
        url: '/searchff',
        data: {"id": getCookie("userId")},
        dataType: 'json',
        success: function (data) {
            console.log("data: " + data);
            var friends = data.friends;
            $.each(friends, function(index,user) {
                var item = $("<li class='me' style='display: none;'>" + user._id + "<i class='icon-minus pull-right'></i></li>");


                $("#newtrip-friend-list").append(item);

                $("#newtrip-friend-list").find("li.me:last-child").slideDown();
                setUsersFriendsClick();
              });
              $("#newtrip-friend-list").append("<li class='me' style='display: none;'><i class='icon-minus pull-right'></i></li>");
        }

    });

}

function setUsersFriendsClick() {

    $("ul").off().on("click", "li", function(event) {
      $(this).find("i").addClass("icon-rotate-90");
      // change background color
      $(this).toggleClass("pressed");

      var user = $(this).text(); // user id
      console.log(user + " clicked");

      var requestBody = '{"id":"' + getCookie("userId") + '","friend":"'+user + '"}';
      console.log("requestBody = " + requestBody);

      if ( $(this).is('.me.pressed') ) {
        console.log("add friend to travel partner: " + user);
      } else {
        console.log("remove friend from travel partner: " + user);
      }

      return false;
    });
}

function createGuid()
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}