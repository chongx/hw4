var tools = {
  NONE: 0,
  RECTANGLE : 1
};
var user = {
  nextId: 0,
  genId: function() {
    var id = user.nextId;
    user.nextId++;
    return id;
  },
  currentElem: null,
  currentTool: tools.RECTANGLE,
  setCurrentElem: function(id) {
    user.currentElem = id;
    var settings = $('#elem-settings');
    settings.detach();
    if(id == null) {
      $('body').append(settings);  
      settings.hide();
    } else {
      $('#' + id).append(settings);
      settings.show();
    }
  }
};


var collection = new PaneCollection();

$(function() {
  collection.panes[0].startHandlers();
});
function PaneCollection() {
  this.current = 0;
  this.panes = [new Pane()];
  this.preview = false;
  this.ordering = [0];
}

PaneCollection.prototype.isCurrent = function(id) {
  return id === this.ordering[this.current];
};

PaneCollection.prototype.isNext = function(id) {
  // Current one is last one in the collection
  if(this.current === this.ordering.length - 1) {
    return false;
  }
  return id === this.ordering[this.current + 1];
};

PaneCollection.prototype.isPrev = function(id) {
  // Current one is first one in the collection
  if(this.current === 0) {
    return false;
  }
  return id === this.ordering[this.current - 1];
};

PaneCollection.prototype.getNext = function() {
  if(this.current === this.ordering.length - 1) {
    return null;
  }
  return this.panes[this.ordering[this.current + 1]];
};

PaneCollection.prototype.getPrev = function() {
  if(this.current === 0) {
    return null;
  }
  return this.panes[this.ordering[this.current - 1]];
};

PaneCollection.prototype.getCurrent = function() {
  return this.panes[this.ordering[this.current]];
};

PaneCollection.prototype.rotateLeft = function() {
  if(collection.getPrev() !== null) {
    collection.getPrev().getNode().addClass('offleft');
  }
  collection.getCurrent().getNode().removeClass('center').addClass('left');
  collection.getNext().getNode().removeClass('right').addClass('center');
  collection.current++;
  if(collection.getNext() !== null) {
    collection.getNext().getNode().removeClass('offright');
    $('#new').hide();
  } else {
    $('#new').show();
  }
};

PaneCollection.prototype.rotateRight = function() {
  if(collection.getNext() !== null) {
    collection.getNext().getNode().addClass('offright');
    $('#new').hide();
  } else {
    $('#new').show();
  }
  collection.getCurrent().getNode().removeClass('center').addClass('right');
  collection.getPrev().getNode().removeClass('left').addClass('center');
  collection.current--;
  if(collection.getPrev() !== null) {
    collection.getPrev().getNode().removeClass('offleft');
  }
};

function Pane() {
  this.id = user.genId();
  this.elems = [];
}

Pane.prototype.getNode = function() {
  return $('#' + this.id);
};

Pane.prototype.startHandlers = function() {
  this.getNode().on('click', this, this.clickHandler);
};

Pane.prototype.clickHandler = function(e) {
  if(!collection.preview) {
    if(collection.isPrev(e.data.id)) {
      collection.rotateRight();
    } else if(collection.isNext(e.data.id)) {
      collection.rotateLeft();
    } else if(collection.isCurrent(e.data.id)) {
      if(user.currentTool != tools.NONE) {
        // CALCULATE PROPER OFFSETS
        var offsetX = e.offsetX;
        var offsetY = e.offsetY;
        var target = e.target;
        while(!$(target).hasClass('pane')) {
          console.log(target);
          offsetX += $(target).position().left;
          offsetY += $(target).position().top;
          target = target.parentNode;
        }
        e.data.addElement(user.currentTool, offsetX, offsetY);
        user.currentTool = tools.NONE;
      } else {
        var target = e.target;
        while(!$(target).hasClass('pane')) {
          if($(target).hasClass("elem")) {
            var id = $(target).attr('id');
            e.data.elems[id].setFocus();
            return;
          }
          target = target.parentNode;
        }
        user.setCurrentElem(null);
      }
    }
  }
  e.preventDefault();
};

Pane.prototype.addElement = function(tool, x, y) {
  var elem = new Elem();
  var node, nodeLeft, nodeTop;
  switch(tool) {
    case tools.RECTANGLE:
      node = $('<div class="elem rectangle" id="' + elem.id + '"></div>');
      nodeLeft = x / this.getNode().width() * 100;
      nodeTop = y / this.getNode().height() * 100;
      node.css('left', nodeLeft + "%")
          .css('top', nodeTop + "%");
      break;
  }
  elem.setPosition(nodeLeft, nodeTop);
  this.getNode().append(node);
  this.elems[elem.id] = elem;
};

function Elem(type, left, top) {
  this.id = user.genId();
  this.type = type;
}

Elem.prototype.setPosition = function(left, top) {
  this.left = left;
  this.top = top;
};

Elem.prototype.setFocus = function() {
  user.setCurrentElem(this.id);
};

Elem.prototype.getNode = function() {
  return $('#' + this.id);
};

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
  currentPane.getNode()
    .removeClass('center')
    .addClass('left');
  if(collection.panes.length > 1) {
    collection.panes[collection.ordering[collection.current - 1]].getNode().addClass("offleft");
  }
  var pane = new Pane();
  collection.panes.push(pane);
  collection.current++;
  collection.ordering.push(pane.id);
  var elem = $('<div class="pane right" id="' + pane.id + '"></div>');
  $('body').append(elem);
  elem.delay(100).queue(function(next) {
    elem.removeClass('right');
    elem.addClass('center');
    next();
  });
  pane.startHandlers();
}
