$(document).ready(function() {
  var resizeTimer,
    $likeList = $('.gamers-item__like-list'),
    slider = $likeList.bxSlider({
      pager: false
    });

  bindEvents();
  $(window).on('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      bindEvents();
    }, 250);

  });

  function bindEvents() {
    var windowWidth = $(document).outerWidth(),
      mobile = windowWidth < 767,
      holderClass = '.gamers-item__like-holder';

    $likeList.parents(holderClass).addClass('visible');

    if (!mobile) {
      slider.destroySlider();
      $likeList.parents(holderClass).removeClass('visible');
    } else {
      $likeList.bxSlider({
        pager: false
      });
    }
  };

  $('.gamers-item__share').on('click', function () {
    $(this).parent().toggleClass('active');
  });

  $('.gamers-item__socials-close').on('click', function () {
    $(this).parents('.gamers-item__share-it').toggleClass('active');
  });

});
