function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
function rgb2hex(rgb){
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return "#" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2);
}

var tools = {
  NONE: 'tool0',
  RECTANGLE : 'tool1'
};

var directions = {
  N: 0,
  S: 1,
  E: 2,
  W: 3,
  NW: 4,
  NE: 5,
  SE: 6,
  SW: 7,
  ANY: 8
}

var user = {
  nextId: 0,
  genId: function() {
    var id = user.nextId;
    user.nextId++;
    return id;
  },
  currentElem: null,
  currentTool: tools.NONE,
  setCurrentElem: function(id) {
    if(user.currentElem == id) {
      return;
    }
    if(user.currentElem != null) {
      $('#' + user.currentElem).removeClass('selected');
    }
    user.currentElem = id;
    $('#elem-settings :input').off('change');
    var settings = $('#elem-settings');
    var overlay = $('#elem-overlay');
    if(id == null) {
      overlay.hide();
      settings.hide();
      return;
    } else {
      var elem = collection.elems[id];
      user.updateElemSettings();
      elem.getNode().addClass('selected');
      settings.show();
      overlay.show();
      switch(elem.type) {
        case tools.RECTANGLE:
          settings.html('Color: <input id="rectcolor" type="text" /><br />Opacity: <input id="rectopacity" type="text" style="width: 20px;" />');
          $('#rectcolor').val(rgb2hex(elem.getNode().css('background-color')));
          $('#rectopacity').val(elem.getNode().css('opacity'));
          $('#rectcolor').on('keyup', elem, user.updateElem);
          $('#rectopacity').on('keyup', elem, user.updateElem);
          break;
      }
    }
  },
  setCurrentTool: function(tool) {
    if(user.currentTool != tools.NONE) {
      $('#' + user.currentTool).removeClass('selected');
    }
    if(tool == tools.NONE) {
      user.currentTool = tool;
      return;
    }
    if(tool != user.currentTool) {
      $('#' + tool).addClass('selected');
      user.currentTool = tool;
      return;
    }
  },
  updateElem: function(e) {
    switch(e.data.type) {
      case tools.RECTANGLE:
        e.data.color = $('#rectcolor').val();
        e.data.getNode().css('background-color', 'rgb(' + 
          hexToR(e.data.color) + ', ' + 
          hexToG(e.data.color) + ', ' + 
          hexToB(e.data.color) + ')' 
        );
        e.data.opacity = $('#rectopacity').val();
        e.data.getNode().css('opacity', e.data.opacity);
        break;
    }
  },
  updateElemSettings: function() {
    if(user.currentElem == null) {
      return;
    }
    var elem = collection.elems[user.currentElem];
    var settings = $('#elem-settings');
    var overlay = $('#elem-overlay');
    var settingsLeft = elem.getNode().position().left + elem.getNode().width() + 20;
    var settingsTop = elem.getNode().position().top;
    settings.css('left', settingsLeft + 'px');
    settings.css('top', settingsTop + 'px');
    overlay.css('left', (elem.getNode().position().left) + 'px');
    overlay.css('top', (elem.getNode().position().top - 1) + 'px');
    overlay.css('width', elem.getNode().width() + 'px');
    overlay.css('height', elem.getNode().height() + 'px');
   }
};

var collection = new PaneCollection();

$(function() {
  collection.panes[0].startHandlers();
  $('.tool').on('click', function(e) {
    user.setCurrentTool($(e.target).attr('id'));
  });
  $('#create_option').on('click', function(e) {
    $('#options_window').hide(500);
    $('#pane_window').show(500);
  });
  $('#navleft').on('click', function(e) {
    collection.rotateRight();
    if(collection.current === 0) {
      $('#navleft').hide();
    } else {
      $('#navleft').show();
    }
    $('#navright').show();
  });
  $('#navright').on('click', function(e) {
    collection.rotateLeft();
    if(collection.current === collection.ordering.length - 1) {
      $('#navright').hide();
    } else {
      $('#navright').show();
    }
    $('#navleft').show();
  });
});
function PaneCollection() {
  this.current = 0;
  this.panes = [new Pane()];
  this.preview = false;
  this.ordering = [0];
  this.elems = [];
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
  var settings = $('#elem-settings');
  var overlay = $('#elem-overlay');
  settings.detach();
  overlay.detach();
  collection.getCurrent().getNode().removeClass('center').addClass('left');
  collection.getNext().getNode().removeClass('right').addClass('center');
  collection.current++;
  if(collection.getNext() !== null) {
    collection.getNext().getNode().removeClass('offright');
    $('#new').hide();
  } else {
    $('#new').show();
  }
  collection.getCurrent().getNode().append(settings);
  collection.getCurrent().getNode().append(overlay);
  user.setCurrentElem(null);
};

PaneCollection.prototype.rotateRight = function() {
  if(collection.getNext() !== null) {
    collection.getNext().getNode().addClass('offright');
    $('#new').hide();
  } else {
    $('#new').show();
  }
  var settings = $('#elem-settings');
  var overlay = $('#elem-overlay');
  settings.detach();
  overlay.detach();
  collection.getCurrent().getNode().removeClass('center').addClass('right');
  collection.getPrev().getNode().removeClass('left').addClass('center');
  collection.current--;
  if(collection.getPrev() !== null) {
    collection.getPrev().getNode().removeClass('offleft');
  }
  collection.getCurrent().getNode().append(settings);
  collection.getCurrent().getNode().append(overlay);
  user.setCurrentElem(null);
};

function Pane() {
  this.id = user.genId();
  this.direction = null;
}

Pane.prototype.getNode = function() {
  return $('#' + this.id);
};

Pane.prototype.startHandlers = function() {
  this.getNode().on('click', this, this.clickHandler);
  this.getNode().on('mousedown', this, this.mousedownHandler);
  this.getNode().on('mouseup', this, this.mouseupHandler);
  this.getNode().on('mousemove', this, this.mousemoveHandler);
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
          offsetX += $(target).position().left;
          offsetY += $(target).position().top;
          target = target.parentNode;
        }
        var elem = e.data.addElement(user.currentTool, offsetX, offsetY);
        user.setCurrentTool(tools.NONE);
        elem.setFocus();
      } else {
        var target = e.target;
        while(!$(target).hasClass('pane')) {
          if($(target).attr('id') === 'elem-settings') {
            return;
          }
          if($(target).hasClass("elem")) {
            var id = $(target).attr('id');
            collection.elems[id].setFocus();
            return;
          }
          target = target.parentNode;
        }
        user.setCurrentElem(null);
      }
    }
  }
};

Pane.prototype.addElement = function(tool, x, y) {
  var elem = new Elem(this.id, tool);
  var node, nodeLeft, nodeTop;
  switch(tool) {
    case tools.RECTANGLE:
      node = $('<div class="elem rectangle" id="' + elem.id + '"></div>');
      break;
  }
  this.getNode().append(node);
  collection.elems[elem.id] = elem;
  this.setPosition(elem.id, x, y);
  return elem;
};

Pane.prototype.setPosition = function(elemId, x, y) {
  var elem = collection.elems[elemId];
  elem.left = x / this.getNode().width() * 100;
  elem.top = y / this.getNode().height() * 100;
  elem.getNode().css('left', elem.left + "%")
      .css('top', elem.top + "%");
  user.updateElemSettings();
};

Pane.prototype.setDimensions = function(elemId, width, height) {
  var elem = collection.elems[elemId];
  elem.width = width / this.getNode().width() * 100;
  elem.height = height / this.getNode().height() * 100;
  elem.getNode().css('width', elem.width + "%")
      .css('height', elem.height + "%");
  user.updateElemSettings();
}

function Elem(paneId, type) {
  this.pane = paneId;
  this.id = user.genId();
  this.type = type;
  switch(type) {
    case tools.RECTANGLE:
      this.width = 5;
      this.height = 10;
      break;
  }
}

Elem.prototype.setFocus = function() {
  user.setCurrentElem(this.id);
};

Elem.prototype.getNode = function() {
  return $('#' + this.id);
};

Pane.prototype.mousemoveHandler = function(e) {
  if(user.currentElem == null) {
    return;
  }
  var target = e.target;
  while(!$(target).hasClass('pane')) {
    e.offsetX += $(target).position().left;
    e.offsetY += $(target).position().top;
    target = target.parentNode;
  }
  if(e.data.direction != null) {
    var elem = collection.elems[user.currentElem];
    var position = elem.getNode().position();
    var width = elem.getNode().width();
    var height = elem.getNode().height();
    switch(e.data.direction) {
      case directions.N:
        e.data.setPosition(elem.id, position.left, e.offsetY);
        e.data.setDimensions(elem.id, width, height + position.top - e.offsetY);
        break;
      case directions.S:
        e.data.setDimensions(elem.id, width, e.offsetY - position.top);
        break;
      case directions.W:
        e.data.setPosition(elem.id, e.offsetX, position.top);
        e.data.setDimensions(elem.id, width + position.left - e.offsetX, height);
        break;
      case directions.E:
        e.data.setDimensions(elem.id, e.offsetX - position.left, height);
        break;
      case directions.NW:
        e.data.setPosition(elem.id, e.offsetX, e.offsetY);
        e.data.setDimensions(elem.id, width + position.left - e.offsetX, height + position.top - e.offsetY);
        break;
      case directions.SW:
        e.data.setPosition(elem.id, e.offsetX, position.top);
        e.data.setDimensions(elem.id, width + position.left - e.offsetX, e.offsetY - position.top);
        break;
      case directions.NE:
        e.data.setPosition(elem.id, position.left, e.offsetY);
        e.data.setDimensions(elem.id, e.offsetX - position.left, height + position.top - e.offsetY);
        break;
      case directions.SE:
        e.data.setDimensions(elem.id, e.offsetX - position.left, e.offsetY - position.top);
        break;
      case directions.ANY:
        var newLeft = e.offsetX - width/2;
        if(newLeft < 0) {
          newLeft = 0;
        } else if(newLeft + width > e.data.getNode().width()) {
          newLeft = e.data.getNode().width() - width;
        }
        var newTop = e.offsetY - height/2;
        if(newTop < 0) {
          newTop = 0;
        } else if(newTop + height > e.data.getNode().height()) {
          newTop = e.data.getNode().height() - height;
        }
        if(elem.left + elem.width > 100) {
          e.data.setPosition(elem.id, elem.left + 100 - (elem.left + elem.width), elem.top);
        }
        e.data.setPosition(elem.id, newLeft, newTop);
        break;
    }
  }
};

Pane.prototype.mousedownHandler = function(e) {
  if(user.currentElem == null) {
    return;
  }
  var target = e.target;
  while(!$(target).hasClass('pane')) {
    e.offsetX += $(target).position().left;
    e.offsetY += $(target).position().top;
    target = target.parentNode;
  }
  var elem = collection.elems[user.currentElem];
  var position = elem.getNode().position();
  var width = elem.getNode().width();
  var height = elem.getNode().height();
  if(e.offsetX <= position.left + 3 && e.offsetX >= position.left - 3) {
    if(e.offsetY <= position.top + 3 && e.offsetY >= position.top - 3) {
      e.data.direction = directions.NW;
    } else if(e.offsetY <= position.top + height + 3 && e.offsetY >= position.top + height - 3) {
      e.data.direction = directions.SW;
    } else if(e.offsetY >= position.top + 3 && e.offsetY <= position.top + height - 3) {
      e.data.direction = directions.W;
    }
  } else if(e.offsetX <= position.left + width + 3 && e.offsetX >= position.left + width - 3) {
    if(e.offsetY <= position.top + 3 && e.offsetY >= position.top - 3) {
      e.data.direction = directions.NE;
    } else if(e.offsetY <= position.top + height + 3 && e.offsetY >= position.top + height - 3) {
      e.data.direction = directions.SE;
    } else if(e.offsetY >= position.top + 3 && e.offsetY <= position.top + height - 3) {
      e.data.direction = directions.E;
    }
  } else if(e.offsetX >= position.left + 3 && e.offsetX <= position.left + width - 3) {
    if(e.offsetY <= position.top + 3 && e.offsetY >= position.top - 3) {
      e.data.direction = directions.N;
    } else if(e.offsetY <= position.top + height + 3 && e.offsetY >= position.top + height - 3) {
      e.data.direction = directions.S;
    } else if(e.offsetY >= position.top + 3 && e.offsetY <= position.top + height - 3) {
      e.data.direction = directions.ANY;
    }
  }
};

Pane.prototype.mouseupHandler = function(e) {
  e.data.direction = null;
};

function togglePreview() {
  if(collection.preview) {
    $('#preview').children()[0].innerHTML = "Preview";
    $('.pane').removeClass('preview');
    collection.preview = false;
    $('.nav').addClass('hidden');
  } else {
    user.setCurrentElem(null);
    user.setCurrentTool(tools.NONE);
    $('#preview').children()[0].innerHTML = "Close";
    $('.pane').addClass('preview');
    collection.preview = true;
    $('.nav').removeClass('hidden');
    if(collection.current === 0) {
      $('#navleft').addClass('hidden');
    }
    if(collection.current === collection.ordering.length - 1) {
      $('#navright').addClass('hidden');
    }
  }
}

function newPane() {
  if(collection.current != collection.ordering.length - 1) {
    return;
  }
  user.setCurrentElem(null);
  var pane = new Pane();
  collection.panes[pane.id] = pane;
  collection.ordering.push(pane.id);
  var elem = $('<div class="pane right" id="' + pane.id + '"></div>');
  $('body').append(elem);
  elem.delay(100).queue(function(next) {
    collection.rotateLeft();
  });
  pane.startHandlers();
}
