//TODO:
//Make user searchable by end of dotabuff webpage (http://www.dotabuff.com/players/EXAMPLEVALUE)
//Find a way to center input form without padding hacks
//Change from a single page to multiple pages


/*******************************NOTE*******************************/
//Single quotes ('') mark element keywords (divs/names/ids/classes/etc.)
//Double quotes ("") mark a string that has no symbollic significance

var verbose = false; //Log events

//Request data from webpage
function fetchStats(webpage){
  $.get(webpage, function(d){
    reqListener(d);
  });
  if(verbose){
    console.log(webpage);
  }
}

//Retrieve data from dotabuff page
function reqListener(data){
  var response = $('<stats />').html(data);

  //Retrieve wins, losses, and abandons. Set to 0 if NaN is found
  var wins = parseInt($('span.wins', response).text().replace(/,/g, ''));
  wins = isNaN(wins)?0:wins;
  var losses = parseInt($('span.losses', response).text().replace(/,/g, ''));
  losses = isNaN(losses)?0:losses;
  var abandons = parseInt($('span.abandons', response).text().replace(/,/g, ''));
  abandons = isNaN(abandons)?0:abandons;
  var winRate = $('dt:contains("Win Rate")', response);

  //Win rate not available, set to 0%
  winRate = (winRate.length === 0)?"0%":winRate.siblings()[0].innerHTML;

  if(verbose){
  	console.log(wins);
  	console.log(losses);
  	console.log(abandons);
  	console.log(winRate);
  }
  $('#steamName').text(localStorage.getItem('steamName'));
  $('#numGames').text(wins+losses+abandons);
  $('#winRate').text(winRate);
  $('#gamesLabel').text("games");
  $('#winsLabel').text("winrate");
  $('#searchPage').hide();
  $('#statsPage').show();
  $('.record.player').remove(); //Remove results from search page
  $('#userInput').val("");
  $('#overlay').css('height', '100%'); //Reset height
  $('#overlay').focus(); //deletes extraneous scrollbar

  //Change background back to normal view
  $('body').css('background-image','url(background.jpg)');
  $('body').css('background-size','cover');

  localStorage.setItem('numGames', wins+losses+abandons);
  localStorage.setItem('winRate', winRate);
}

//Search for player on dotabuff
function search(){

  var query = $('#userInput').val();
  if(verbose){
  	console.log(query);
  }
  $.get("http://www.dotabuff.com/search?utf8=%E2%9C%93&q=" + query, function(d){
    var response = $('<results />').html(d);
    var title = $('title', response)[0].innerHTML;
    if(verbose){
      console.log(title);
    }
    if(title === ""){ //Unexpected page
      return;
    }
    if(title.slice(0,14) !== "Search Results"){ //If only one result of search
      title = title.slice(0,title.indexOf("-"));
      if(verbose){
        console.log(title);
      }
      var userPage = "http://dotabuff.com/search?utf8=%E2%9C%93&q=" + query;
      localStorage.setItem('steamName', title);
      localStorage.setItem('statsPage', userPage);
      fetchStats(userPage);
      return;
    }
    var players = $('.result.result-player', response);
    var searchPage = $('#searchPage');
    $('.result.result-player').remove(); //Remove old results

    //Display results
    for(var i = 0; i<players.length; i++){
    	if(verbose){
        console.log(players[i]);
      }

      $('a[href]', players[i]).contents().unwrap(); //allow images to be formatted

      var lastPlayed = $('time[datetime]', players[i]).attr('datetime'); //Get UTC time
      if(lastPlayed){ //Has played at some point
        lastPlayed = moment(lastPlayed).fromNow(); //Convert to "Played X min/hour ago"
        $('time',players[i])[0].innerHTML = lastPlayed; //Set field
      }
      searchPage.append($(players[i])); //Add edited player div to popup page
    }
    if(players.length > 0){ //Change background to tiled view
      $('body').css('background-image','url(background-tiled.jpg)');
      $('body').css('background-size','200%');
    }
    else{ //Change background to normal view
      $('body').css('background-image','url(background.jpg)');
      $('body').css('background-size','cover');
    }

    $('#overlay').height($('html').height()); //Stretch to cover all
    $('#overlay').focus(); //deletes extraneous scrollbar
    $('#userInput').focus(); //shift focus back for typing

    //When user selects a player
    $('.result-player').click(function(){
      var userPage = "http://dotabuff.com"+$('.inner',this).attr('data-link-to');
      localStorage.setItem('steamName', $('div.identity>.head', this)[0].textContent);
      localStorage.setItem('statsPage', userPage);
      fetchStats(userPage);
    });
  });
}


//Main Function

//If data is cached
if(localStorage.getItem('statsPage') != null){
  $('#searchPage').hide();
  $('#steamName').text(localStorage.getItem('steamName'));
  $('#numGames').text(localStorage.getItem('numGames'));
  $('#winRate').text(localStorage.getItem('winRate'));
  $('#gamesLabel').text("games");
  $('#winsLabel').text("winrate");
  fetchStats(localStorage.getItem('statsPage'));
}
else{
  $('#statsPage').hide();
}

//Back to search page
$('#backButton').click(function(){
  $('#statsPage').hide();
  $('#searchPage').show();
  if($('.result.result-player').length > 0){ //change to correct background if needed
    $('body').css('background-image','url(background-tiled.jpg)');
    $('body').css('background-size','200%');
  }
  localStorage.clear();
});

//Go to actual dotabuff page
$('#steamName').click(function(){
  window.open(localStorage.getItem('statsPage'));
});

/*
*Does live search
*  Waits 300ms before searching to make sure
*  user is done typing
*/
var timer = 0;
$('#userInput').keyup(function(e){
  if(timer){
    clearTimeout(timer);
  }
  timer = setTimeout(function(){
    search();
    console.timeEnd("Keyup");
  }, 300);
});

//When extension loads
$(document).ready(function(){
  $('#userInput').focus();
});