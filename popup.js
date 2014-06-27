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
  console.log(webpage);
}
//Retrieve data from dotabuff page
function reqListener(data){
  var response = $('<stats />').html(data);
  response = $('td:contains("Stats Recorded")', response);
  console.log(response);
  var numGames = response.siblings()[0].firstChild.textContent;
  var winRate = response.siblings()[1].firstChild.textContent;
  $('#steamName').text(localStorage.getItem('steamName'));
  $('#numGames').text(numGames);
  $('#winRate').text(winRate);
  $('#gamesLabel').text("games");
  $('#winsLabel').text("winrate");
  $('#searchPage').remove();
  //document.body.removeChild(document.getElementById('searchPage'));
  $('#backButton').show();
  $('#overlay').focus(); //deletes extraneous scrollbar
  localStorage.setItem('numGames', numGames);
  localStorage.setItem('winRate', winRate);
}
//Search for player on dotabuff
function search(){
  var query = $('#userInput').val();
  console.log(query);
  $.get("http://dotabuff.com/search?utf8=%E2%9C%93&q=" + query, function(d){
    var response = $('<results />').html(d);
    var title = $('title', response)[0].innerHTML;
    if(title.slice(26) === "") //Unexpected page
      return;
    if(title.slice(26) !== "Search Results"){ //If only one result of search
      var userPage = "http://dotabuff.com/search?utf8=%E2%9C%93&q=" + query;
      localStorage.setItem('steamName', title.slice(26));
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
      console.log(players[i]);

      $('a[href]', players[i]).contents().unwrap();
      var extra = players[i].children[2];
      extra.removeChild(extra.firstChild);

      var lastPlayed = $('time[datetime]', players[i]).attr('datetime');
      if(lastPlayed){ //Has played at some point
        lastPlayed = moment(lastPlayed).fromNow();
        extra.firstChild.children[0].innerHTML = lastPlayed;
      }
      searchPage.append($(players[i]));
    }
    $('#overlay').focus(); //deletes extraneous scrollbar
    $('#userInput').focus(); //shift focus back for typing

    //When user selects a player
    $('.player').click(function(){
      var userPage = dotaBuff+$(this).attr('data-link-to');
      localStorage.setItem('steamName', this.children[1].innerHTML);
      localStorage.setItem('statsPage', userPage);
      fetchStats(userPage);
    });
  });
}
//If data is cached
var dotaBuff = "http://dotabuff.com";
$('#backButton').hide();
if(localStorage.getItem('statsPage') != null){
  $('#searchPage').remove();
  $('#steamName').text(localStorage.getItem('steamName'));
  $('#numGames').text(localStorage.getItem('numGames'));
  $('#winRate').text(localStorage.getItem('winRate'));
  $('#gamesLabel').text("games");
  $('#winsLabel').text("winrate");
  $('#backButton').show();
  fetchStats(localStorage.getItem('statsPage'));
}
//Search for something else
$('#backButton').click(function(){
  $('#statsPage').remove();
  hardRefresh();
});
//Get dotabuff page
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