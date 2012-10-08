var current = 0;
var ordering = [0,6,24];

$(function() {
  $("#navleft").on("click", function(e) {
    $("#p" + ordering[current]).removeClass("center").addClass("right");
    $("#p" + ordering[current - 1]).addClass("center").removeClass("left");
    if(current == 1) {
      $("#navleft").hide();
    } else {
      $("#navleft").show();
    }
    current--;
    $("#navright").show();
  });
  $("#navright").on("click", function(e) {
    $("#p" + ordering[current]).removeClass("center").addClass("left");
    $("#p" + ordering[current + 1]).addClass("center").removeClass("right");
    if(current == ordering.length - 2) {
      $("#navright").hide();
    } else {
      $("#navright").show();
    }
    current++;
    $("#navleft").show();
  });
});

