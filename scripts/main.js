var nextId = 0;
var collection = new PaneCollection();

$(function() {
  $('#0').on('click', collection.panes[0], paneClickHandler);
});

function PaneCollection() {
  this.current = 0;
  this.panes = [new Pane()];
  this.preview = false;
  this.ordering = [0];
}

PaneCollection.prototype.isCurrent = function(id) {
  return id === this.ordering[this.current];
}

PaneCollection.prototype.isNext = function(id) {
  // Current one is last one in the collection
  if(this.current === this.ordering.length - 1) {
    return false;
  }
  return id === this.ordering[this.current + 1];
}

PaneCollection.prototype.isPrev = function(id) {
  // Current one is first one in the collection
  if(this.current === 0) {
    return false;
  }
  return id === this.ordering[this.current - 1];
}

PaneCollection.prototype.getNext = function() {
  if(this.current === this.ordering.length - 1) {
    return null;
  }
  return this.panes[this.ordering[this.current + 1]];
}

PaneCollection.prototype.getPrev = function() {
  if(this.current === 0) {
    return null;
  }
  return this.panes[this.ordering[this.current - 1]];
}

PaneCollection.prototype.getCurrent = function() {
  return this.panes[this.ordering[this.current]];
}

PaneCollection.prototype.rotateLeft = function() {
  if(collection.getPrev() !== null) {
    collection.getPrev().getElement().addClass('offleft');
  }
  collection.getCurrent().getElement().removeClass('center').addClass('left');
  collection.getNext().getElement().removeClass('right').addClass('center');
  collection.current++;
  if(collection.getNext() !== null) {
    collection.getNext().getElement().removeClass('offright');
    $('#new').hide();
  } else {
    $('#new').show();
  }
}

PaneCollection.prototype.rotateRight = function() {
  if(collection.getNext() !== null) {
    collection.getNext().getElement().addClass('offright');
    $('#new').hide();
  } else {
    $('#new').show();
  }
  collection.getCurrent().getElement().removeClass('center').addClass('right');
  collection.getPrev().getElement().removeClass('left').addClass('center');
  collection.current--;
  if(collection.getPrev() !== null) {
    collection.getPrev().getElement().removeClass('offleft');
  }
}

function Pane() {
  this.id = nextId;
  nextId++;
  this.paneId = "#" + this.id;
}

Pane.prototype.getElement = function() {
  return $('#' + this.id);
}

function togglePreview() {
  if(collection.preview) {
    $('#preview').children()[0].innerHTML = "Preview";
    $('div.center').removeClass('preview');
    collection.preview = false;
    $('.nav').addClass('hidden');
  } else {
    $('#preview').children()[0].innerHTML = "Close";
    $('div.center').addClass('preview');
    collection.preview = true;
    $('.nav').removeClass('hidden');
  }
}

function newPane() {
  if(collection.current != collection.ordering.length - 1) {
    return;
  }
  var currentPane = collection.getCurrent();
  $(currentPane.paneId)
    .removeClass('center')
    .addClass('left');
  if(collection.panes.length > 1) {
    $(collection.panes[collection.ordering[collection.current - 1]].paneId).addClass("offleft");
  }
  var pane = new Pane();
  collection.panes.push(pane);
  collection.current++;
  collection.ordering.push(pane.id);
  var elem = $('<div class="pane right" id="' + pane.id + '"></div>');
  elem.on('click', pane, paneClickHandler);
  $('body').append(elem);
  elem.delay(100).queue(function(next) {
    elem.removeClass('right');
    elem.addClass('center');
    next();
  });
}

function paneClickHandler(e) {
  if(!collection.preview) {
    if(collection.isPrev(e.data.id)) {
      collection.rotateRight();
    } else if(collection.isNext(e.data.id)) {
      collection.rotateLeft();
    } else if(collection.isCurrent(e.data.id)) {
      
    }
  }
  e.preventDefault();
}
