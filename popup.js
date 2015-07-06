//TODO:
//Make user findable by end of dotabuff webpage (http://www.dotabuff.com/players/EXAMPLEVALUE)
//Update to use "font-awesome" checkmark (this is what actual dotabuff uses)
//Find a better way to change background/bind overlay height than JQuery commands
//Find a way to center input form with padding hacks
//Find a better way to reset than "hardRefresh"


var verbose = true; //Log events


//Clear storage and refresh
function hardRefresh(){
  localStorage.clear();
  document.location.reload(true);
  document.location.reload(false);
}
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
  $('#searchPage').remove();
  $('#backButton').show();
  $('#overlay').focus(); //deletes extraneous scrollbar
  $('#overlay').height("100%"); //Set overlay to proper height

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
    title = title.slice(0, title.indexOf(":"));
    if(verbose){
      console.log(title);
    }
    if(title === ""){ //Unexpected page
      return;
    }
    if(title !== "Search Results"){ //If only one result of search
      title = title.slice(0, title.indexOf("-")-1); //Cut off remainder
      var userPage = "http://dotabuff.com/search?utf8=%E2%9C%93&q=" + query;
      localStorage.setItem('steamName', title);
      localStorage.setItem('statsPage', userPage);
      fetchStats(userPage);
      return;
    }
    var players = $('.record.player', response);
    var searchPage = $('#searchPage');
    var oldResults = $('.record.player');
    oldResults.remove();

    //Display results
    for(var i = 0; i<players.length; i++){
    	if(verbose){
        console.log(players[i]);
      }

      $('a[href]', players[i]).contents().unwrap(); //remove html "<a href='x'></a>" tags
      var extra = players[i].children[2]; //Get extra details (steamID and last played)
      extra.removeChild(extra.firstChild); //Delete steam ID

      var lastPlayed = $('time[datetime]', players[i]).attr('datetime'); //Get UTC time
      if(lastPlayed){ //Has played at some point
        lastPlayed = moment(lastPlayed).fromNow(); //Convert to "Played X min/hour ago"
        extra.firstChild.children[0].innerHTML = lastPlayed;
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

    $('#overlay').height($('html').height()); //Set overlay to proper height
    $('#overlay').focus(); //deletes extraneous scrollbar
    $('#userInput').focus(); //shift focus back for typing

    //When user selects a player
    $('.player').click(function(){
      var userPage = dotaBuff+$(this).attr('data-link-to');
      localStorage.setItem('steamName', $('div.name', this)[0].textContent);
      localStorage.setItem('statsPage', userPage);
      fetchStats(userPage);
    });
  });
}


//Main Function

//If data is cached
var dotaBuff = "http://dotabuff.com";
if(localStorage.getItem('statsPage') != null){
  $('#searchPage').remove();
  $('#steamName').text(localStorage.getItem('steamName'));
  $('#numGames').text(localStorage.getItem('numGames'));
  $('#winRate').text(localStorage.getItem('winRate'));
  $('#gamesLabel').text("games");
  $('#winsLabel').text("winrate");
  fetchStats(localStorage.getItem('statsPage'));
}
else{
  $('#backButton').hide();
}
//Search for something else
$('#backButton').click(function(){
  $('#statsPage').remove();
  hardRefresh();
});
//Go to actual dotabuff page
$('#steamName').click(function(){
  window.open(localStorage.getItem('statsPage'));
});

//Live search, waits 300ms before searching
//to make sure user is done typing
var timer = 0;
$('#userInput').keyup(function(e){
  if(timer){
    clearTimeout(timer);
  }
  timer = setTimeout(function(){
    search()
  }, 300);
});
//When extension loads
$(document).ready(function(){
  $('#userInput').focus();
});