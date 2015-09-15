$(document).ready(function(){
  $('.show_add_form').on('click', function(event){
    $('.add_game').show();
    $('.show_add_form').hide();
  });

  $('.add_game').on('submit',function(event){
    event.preventDefault();

    var request = $.ajax({
      url: '/games',
      type: 'POST',
      data: $('.add_game').serialize()
    });

    request.done(function(data){
      $('.show_add_form').show();
      $('.add_game').hide();
      $('.all_games').html(data);
    });

    var request2 = $.get('/games');

    request2.done(function(data){
      $('.add_game').html(data);
    });
  })

});