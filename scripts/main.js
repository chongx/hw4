/**
 * Authors: Alexander Malyshev (amalyshe), Chong Xie (chongx)
 */

// Some functions for converting rgb to hex and back
function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
function hex2rgb(hex) {
  return "rgb(" + hexToR(hex) + ", " + hexToG(hex) + ", " + hexToB(hex) + ")";
}
function rgb2hex(rgb){
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return "#" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2);
}

var canvas = document.getElementById('tutorial_canvas');
var ctx = canvas.getContext("2d");

// List of all the tools we can use
var tools = {
  NONE: 'tool0',
  RECTANGLE : 'tool1',
  TEXT: 'tool2',
  IMAGE: 'tool3'
};

// Used for dragging and resizing
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

var backgrounds = {
  COLOR: '0',
  GRADIENT: '1'
};

var fonts = [
  {text: 'Amaranth', font: '"Amaranth", serif'},
  {text: 'Arial', font: 'Arial, Helvetica, sans-serif'},
  {text: 'Palatino Linotype', font: '"Palatino Linotype", "Book Antiqua", Palatino, serif'},
  {text: 'Times New Roman', font: '"Times New Roman", Serif'}
];

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
    if(id == null) {
      settings.hide();
      return;
    } else {
      var elem = collection.elems[id];
      user.updateElemSettings();
      elem.getNode().addClass('selected');
      settings.show();
      elem.showSettings();
    }
  },
  setCurrentTool: function(tool) {
    if(user.currentTool !== tools.NONE) {
      $('#' + user.currentTool).toggleClass('selected');
    }
    if(tool !== user.currentTool) {
      $('#' + tool).toggleClass('selected');
      user.currentTool = tool;
    } else {
      user.currentTool = tools.NONE;
    }
  },
  updateElemSettings: function() {
    if(user.currentElem == null) {
      return;
    }
    var elem = collection.elems[user.currentElem];
    var settings = $('#elem-settings');
    var settingsLeft = elem.getNode().position().left + elem.getNode().width() + 20;
    var settingsTop = elem.getNode().position().top;
    settings.css('left', settingsLeft + 'px');
    settings.css('top', settingsTop + 'px');
   }
};

var collection = new PaneCollection();

$(function() {
  $('#pane_bgcolor').ColorPicker({
    color: '#3c8040',
    onChange: function (hsb, hex, rgb) {
      $('#pane_bgcolor').css('background-color', '#' + hex);
      collection.getCurrent().setBackground($('#pane_bg').val(), '#' + hex);
    }
  });

  $('#pane_bggradient1').ColorPicker({
    color: '#eeeeee',
    onChange: function (hsb, hex, rgb) {
      $('#pane_bggradient1').css('background-color', '#' + hex);
      collection.getCurrent().setBackground($('#pane_bg').val(), rgb2hex($('#pane_bggradient1').css('background-color')), rgb2hex($('#pane_bggradient2').css('backgroundColor')));
    }
  });

  $('#pane_bggradient2').ColorPicker({
    color: '#999999',
    onChange: function (hsb, hex, rgb) {
      $('#pane_bggradient2').css('background-color', '#' + hex);
      collection.getCurrent().setBackground($('#pane_bg').val(), rgb2hex($('#pane_bggradient1').css('background-color')), rgb2hex($('#pane_bggradient2').css('backgroundColor')));
    }
  });

  collection.panes[0].startHandlers();
  $('.tool').on('click', function(e) {
    user.setCurrentTool($(e.target).attr('id'));
  });
  $('#delete_pane').on('click', function(e) {
    collection.deleteCurrentPane();
  });
  $('#create_option').on('click', function(e) {
    $('#options_window').hide(500);
    $('#pane_window').show(500);
    $('.topbar-button').show();
  });
  $('#load_option').on('click', function(e) {
    $('#load_box').show();
    $('#load_submit').show();
  });
  $('#load_submit').on('click', function(e) {
    var save = JSON.parse($('#load_box').val());
    user.nextId = save.user.nextId;
    collection.copy(save.collection);
    $('.pane.center').remove();
    for(var i in collection.ordering) {
      var paneobj = new Pane();
      paneobj.copy(collection.panes[collection.ordering[i]]);
      collection.panes[collection.ordering[i]] = paneobj;
      var pane = collection.panes[collection.ordering[i]].genNode();
      $('#pane_window').append(pane);
      paneobj.startHandlers();
      if(paneobj.backgroundType === backgrounds.COLOR) {
        paneobj.setBackground(paneobj.backgroundType, paneobj.backgroundColor);
      } else {
        paneobj.setBackground(paneobj.backgroundType, paneobj.backgroundGradient1, paneobj.backgroundGradient2);
      }
    }
    for(var j in collection.elems) {
      if(collection.elems[j] === null) {
        continue;
      }
      var elemobj;
      switch(collection.elems[j].type) {
        case tools.RECTANGLE:
          elemobj = new Rectangle();
          break;
        case tools.TEXT:
          elemobj = new Text();
          break;
        case tools.IMAGE:
          elemobj = new Img();
          break;
      }
      elemobj.copy(collection.elems[j]);
      collection.elems[j] = elemobj;
      collection.elems[j].addToPane(collection.elems[j].pane);
    }
    var elem_settings = $('<div id="elem-settings"></div>');
    collection.getCurrent().getNode().append(elem_settings);
    $('#options_window').hide(500);
    $('#pane_window').show(500);
    $('.topbar-button').show();
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
  $('#pane_bg').on('change', function() {
    var type = $('#pane_bg').val();
    collection.getCurrent().setBackground(type);
    if(collection.getCurrent().backgroundType === backgrounds.COLOR) {
      $('#pane_bgcolor').css('display', 'inline-block');
      $('#pane_bggradient1').hide();
      $('#pane_bggradient2').hide();
    } else {
      $('#pane_bgcolor').hide();
      $('#pane_bggradient1').css('display', 'inline-block');
      $('#pane_bggradient2').css('display', 'inline-block');
    }
  });
  filepicker.setKey('AY-Ek61HTTxKhgXYEqFBqz');
});

function PaneCollection() {
  this.current = 0;
  this.panes = [new Pane()];
  this.preview = false;
  this.save = false;
  this.source = false;
  this.tutorial = false;
  this.ordering = [0];
  this.elems = [];
}

PaneCollection.prototype.copy = function(src) {
  this.current = src.current;
  this.panes = src.panes;
  this.ordering = src.ordering;
  this.elems = src.elems;
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

PaneCollection.prototype.getPane = function(paneId) {
  return collection.panes[paneId];
};

PaneCollection.prototype.deleteCurrentPane = function() {
  if(this.ordering.length === 1) {
    return;
  }
  var pane = this.getCurrent();
  var curr = this.current;
  // rotate
  if(curr === 0) {
    collection.rotateLeft();
    this.current--;
  } else {
    collection.rotateRight();
  }
  // Remove from panes
  delete this.panes[pane.id];
  this.ordering.splice(curr, 1);

  if(curr !== 0 && collection.getNext() !== null) {
    collection.getNext().getNode().removeClass('offright');
  }

  // delete all elems
  for(var i in this.elems) {
    if(this.elems[i] === null) {
      continue;
    }
    if(this.elems[i].pane === pane.id) {
      this.elems[i].deleteElem({data: this.elems[i]});
    }
  }
  pane.getNode().remove();
};

PaneCollection.prototype.rotateLeft = function() {
  if(collection.getPrev() !== null) {
    collection.getPrev().getNode().addClass('offleft');
  }
  var settings = $('#elem-settings');
  settings.detach();
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
  user.setCurrentElem(null);
  $('#pane_bg').val(collection.getCurrent().backgroundType);
  $('#pane_bgcolor').css('background-color', collection.getCurrent().backgroundColor);
  $('#pane_bggradient1').css('background-color', collection.getCurrent().backgroundGradient1);
  $('#pane_bggradient2').css('background-color', collection.getCurrent().backgroundGradient2);
  if(collection.getCurrent().backgroundType === backgrounds.COLOR) {
    $('#pane_bgcolor').css('display', 'inline-block');
    $('#pane_bggradient1').hide();
    $('#pane_bggradient2').hide();
  } else {
    $('#pane_bgcolor').hide();
    $('#pane_bggradient1').css('display', 'inline-block');
    $('#pane_bggradient2').css('display', 'inline-block');
  }
};

PaneCollection.prototype.rotateRight = function() {
  if(collection.getNext() !== null) {
    collection.getNext().getNode().addClass('offright');
    $('#new').hide();
  } else {
    $('#new').show();
  }
  var settings = $('#elem-settings');
  settings.detach();
  collection.getCurrent().getNode().removeClass('center').addClass('right');
  collection.getPrev().getNode().removeClass('left').addClass('center');
  collection.current--;
  if(collection.getPrev() !== null) {
    collection.getPrev().getNode().removeClass('offleft');
  }
  collection.getCurrent().getNode().append(settings);
  user.setCurrentElem(null);
  $('#pane_bg').val(collection.getCurrent().backgroundType);
  $('#pane_bgcolor').css('background-color', collection.getCurrent().backgroundColor);
  $('#pane_bggradient1').css('background-color', collection.getCurrent().backgroundGradient1);
  $('#pane_bggradient2').css('background-color', collection.getCurrent().backgroundGradient2);
  if(collection.getCurrent().backgroundType === backgrounds.COLOR) {
    $('#pane_bgcolor').css('display', 'inline-block');
    $('#pane_bggradient1').hide();
    $('#pane_bggradient2').hide();
  } else {
    $('#pane_bgcolor').hide();
    $('#pane_bggradient1').css('display', 'inline-block');
    $('#pane_bggradient2').css('display', 'inline-block');
  }
};

function Pane() {
  this.id = user.genId();
  this.direction = null;
  this.backgroundType = backgrounds.COLOR;
  this.backgroundColor = '#3c8040';
  this.backgroundGradient1 = '#eeeeee';
  this.backgroundGradient2 = '#999999';
  this.highestZ = 1;
  this.lowestZ = 1;
}

Pane.prototype.copy = function(src) {
  this.id = src.id;
  this.backgroundType = src.backgroundType;
  this.backgroundColor = src.backgroundColor;
  this.backgroundGradient1 = src.backgroundGradient1;
  this.backgroundGradient2 = src.backgroundGradient2;
  this.highestZ = src.highestZ;
  this.lowestZ = src.lowestZ;
};

Pane.prototype.getNode = function() {
  return $('#' + this.id);
};

Pane.prototype.genNode = function() {
  var html = '<div class="pane" id="' + this.id + '"></div>';
  var node = $(html);
  if(collection.isPrev(this.id)) {
    node.addClass('left');
  } else if (collection.isCurrent(this.id)) {
    node.addClass('center');
  } else if(collection.isNext(this.id)) {
    node.addClass('right');
  } else if(collection.current > collection.ordering.indexOf(this.id)) {
    node.addClass('left');
    node.addClass('offleft');
  } else {
    node.addClass('right');
    node.addClass('offright');
  }
  return node;
};

Pane.prototype.startHandlers = function() {
  this.getNode().on('click', this, this.clickHandler);
  this.getNode().on('mousedown', this, this.mousedownHandler);
  this.getNode().on('mouseup', this, this.mouseupHandler);
  this.getNode().on('mousemove', this, this.mousemoveHandler);
  this.getNode().on('mouseleave', this, this.mouseupHandler);
};

Pane.prototype.clickHandler = function(e) {
  if (!(e.offsetX || e.offsetY)) {
    e.offsetX = parseInt(e.pageX) - parseInt($(e.target).position().left);
    e.offsetY = parseInt(e.pageY) - parseInt($(e.target).position().top);
  }
  if(!collection.preview) {
    if(collection.isPrev(e.data.id)) {
      collection.rotateRight();
    } else if(collection.isNext(e.data.id)) {
      collection.rotateLeft();
    } else if(collection.isCurrent(e.data.id)) {
      if(user.currentTool != tools.NONE) {
        // CALCULATE PROPER OFFSETS
        var offsetX = e.pageX - collection.getCurrent().getNode().position().left;
        var offsetY = e.pageY - collection.getCurrent().getNode().position().top;
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
  var elem;
  switch(tool) {
    case tools.RECTANGLE:
      elem = new Rectangle(this.id);
      break;
    case tools.TEXT:
      elem = new Text(this.id);
      break;
    case tools.IMAGE:
      elem = new Img(this.id);
      break;
  }
  var node, nodeLeft, nodeTop;
  elem.addToPane(this.id);
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
};

Pane.prototype.setBackground = function(type, color1, color2) {
  this.backgroundType = type;
  if(color1 !== undefined) {
    if(this.backgroundType === backgrounds.COLOR) {
      this.backgroundColor = color1;
    } else {
      this.backgroundGradient1 = color1;
      this.backgroundGradient2 = color2;
    }
  }

  if(type === backgrounds.COLOR) {
    this.getNode().css('background-color', this.backgroundColor);
    this.getNode().css('background-image', '');
  } else {
    this.getNode().css('background-image', '-webkit-linear-gradient(top, ' + hex2rgb(this.backgroundGradient1) + ', ' + hex2rgb(this.backgroundGradient2) + ')');
    this.getNode().css('background-image', '-moz-linear-gradient(top, ' + hex2rgb(this.backgroundGradient1) + ', ' + hex2rgb(this.backgroundGradient2) + ')');
  }
};

Pane.prototype.mousemoveHandler = function(e) {
  if(user.currentElem == null) {
    return;
  }
  if (!(e.offsetX || e.offsetY)) {
    e.offsetX = parseInt(e.pageX) - parseInt($(e.target).position().left);
    e.offsetY = parseInt(e.pageY) - parseInt($(e.target).position().top);
  }
  var target = collection.getCurrent().getNode();
  e.offsetX = e.pageX - collection.getCurrent().getNode().position().left;
  e.offsetY = e.pageY - collection.getCurrent().getNode().position().top;

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
  var target = collection.getCurrent().getNode();
  e.offsetX = e.pageX - collection.getCurrent().getNode().position().left;
  e.offsetY = e.pageY - collection.getCurrent().getNode().position().top;
  e.data.lastOffsetX = e.offsetX;
  e.data.lastOffsetY = e.offsetY;
  var elem = collection.elems[user.currentElem];
  var position = elem.getNode().position();
  var width = elem.getNode().width();
  var height = elem.getNode().height();
  if(e.offsetX <= position.left + 8 && e.offsetX >= position.left - 8) {
    if(e.offsetY <= position.top + 8 && e.offsetY >= position.top - 8) {
      e.data.direction = directions.NW;
    } else if(e.offsetY <= position.top + height + 8 && e.offsetY >= position.top + height - 8) {
      e.data.direction = directions.SW;
    } else if(e.offsetY >= position.top + 8 && e.offsetY <= position.top + height - 8) {
      e.data.direction = directions.W;
    }
  } else if(e.offsetX <= position.left + width + 8 && e.offsetX >= position.left + width - 8) {
    if(e.offsetY <= position.top + 8 && e.offsetY >= position.top - 8) {
      e.data.direction = directions.NE;
    } else if(e.offsetY <= position.top + height + 8 && e.offsetY >= position.top + height - 8) {
      e.data.direction = directions.SE;
    } else if(e.offsetY >= position.top + 8 && e.offsetY <= position.top + height - 8) {
      e.data.direction = directions.E;
    }
  } else if(e.offsetX >= position.left + 8 && e.offsetX <= position.left + width - 8) {
    if(e.offsetY <= position.top + 8 && e.offsetY >= position.top - 8) {
      e.data.direction = directions.N;
    } else if(e.offsetY <= position.top + height + 8 && e.offsetY >= position.top + height - 8) {
      e.data.direction = directions.S;
    } else if(e.offsetY >= position.top + 8 && e.offsetY <= position.top + height - 8) {
      e.data.direction = directions.ANY;
    }
  }
};

Pane.prototype.mouseupHandler = function(e) {
  e.data.direction = null;
};

function Elem(paneId) {
  this.pane = paneId;
  this.id = user.genId();
  this.z = 1;
  this.left = 0;
  this.top = 0;
}

Elem.prototype.setFocus = function() {
  user.setCurrentElem(this.id);
};

Elem.prototype.getNode = function() {
  return $('#' + this.id);
};

Elem.prototype.moveFront = function(e) {
  e.data.z = ++collection.getCurrent().highestZ;
  e.data.getNode().css('z-index', e.data.z);
};

Elem.prototype.moveBack = function(e) {
  e.data.z = --collection.getCurrent().lowestZ;
  e.data.getNode().css('z-index', e.data.z);
};

Elem.prototype.deleteElem = function(e) {
  e.data.getNode().remove();
  user.setCurrentElem(null);
  collection.elems[e.data.id] = null;
};

function Rectangle(paneId) {
  Elem.call(this, paneId);
  this.width = 5;
  this.height = 10;
  this.color = '#ffffff';
  this.type = tools.RECTANGLE;
  this.opacity = 1.0;
}

Rectangle.prototype = new Elem();
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.copy = function(src) {
  this.pane = src.pane;
  this.id = src.id;
  this.z = src.z;
  this.width = src.width;
  this.height = src.height;
  this.color = src.color;
  this.left = src.left;
  this.top = src.top;
  this.opacity = src.opacity;
};

Rectangle.prototype.showSettings = function() {
  var html = 'Color: <div id="rectcolor" class="colorSelector" style="background-color: ' + this.color + '"></div><br />Opacity: <input id="rectopacity" type="text" style="width: 20px;" /><br />';
  html += '<button id="forward">Move To Front</button> <button id="back">Move To Back</button>';
  html += '<br /><button id="delete">Delete</button';
  $('#elem-settings').html(html);
  $('#rectopacity').val(this.getNode().css('opacity'));
  var self = this;
  $('#rectcolor').ColorPicker({
    color: self.color,
    onChange: function (hsb, hex, rgb) {
      $('#rectcolor').css('background-color', '#' + hex);
      self.updateElem({data: self});
    }
  });
  $('#rectopacity').on('keyup', this, this.updateElem);
  $('#forward').on('click', this, this.moveFront);
  $('#back').on('click', this, this.moveBack);
  $('#delete').on('click', this, this.deleteElem);
};

Rectangle.prototype.updateElem = function(e) {
  e.data.color = rgb2hex($('#rectcolor').css('background-color'));
  e.data.getNode().css('background-color', e.data.color);
  e.data.opacity = $('#rectopacity').val();
  e.data.getNode().css('opacity', e.data.opacity);
};

Rectangle.prototype.addToPane = function(paneId) {
  var node = $('<div class="elem rectangle" id="' + this.id + '"></div>');
  collection.getPane(paneId).getNode().append(node);
  node.css('background-color', this.color);
  node.css('opacity', this.opacity);
  node.css('width', this.width + '%');
  node.css('height', this.height + '%');
  node.css('z-index', this.z);
  node.css('left', this.left + "%")
      .css('top', this.top + "%");
};

function Text(paneId) {
  Elem.call(this, paneId);
  this.width = 10;
  this.height = 20;
  this.text = 'Enter your text here';
  this.fontSize = 40;
  this.font = 0;
  this.color = '#000000';
  this.type = tools.TEXT;
}
Text.prototype = new Elem();
Text.prototype.constructor = Text;

Text.prototype.copy = function(src) {
  this.pane = src.pane;
  this.id = src.id;
  this.z = src.z;
  this.width = src.width;
  this.height = src.height;
  this.text = src.text;
  this.fontSize = src.fontSize;
  this.font = src.font;
  this.color = src.color;
  this.left = src.left;
  this.top = src.top;
}
Text.prototype.showSettings = function() {
  var html = 'Text: <br /><textarea id="texttext">' + this.text + '</textarea><br />';
  html += 'Font: <select id="textfont">';
  for(var i in fonts) {
    html += '<option value="' + i + '">' + fonts[i].text + '</option>';
  }
  html += '</select><br />';
  html += 'Size: <input type="text" id="textsize" value="' + this.fontSize + '" style="width: 20px" />px<br />';
  html += 'Color: <div id="textcolor" class="colorSelector" style="background-color: ' + this.color + '"></div><br />';
  html += '<button id="forward">Move To Front</button> <button id="back">Move To Back</button>';
  html += '<br /><button id="delete">Delete</button';
  $('#elem-settings').html(html);
  var self = this;
  $('#textcolor').ColorPicker({
    color: self.color,
    onChange: function (hsb, hex, rgb) {
      $('#textcolor').css('background-color', '#' + hex);
      self.updateElem({data: self});
    }
  });
  $('#texttext').on('keyup', this, this.updateElem);
  $('#textfont').on('change', this, this.updateElem);
  $('#textsize').on('keyup', this, this.updateElem);
  $('#forward').on('click', this, this.moveFront);
  $('#back').on('click', this, this.moveBack);
  $('#delete').on('click', this, this.deleteElem);
};

Text.prototype.updateElem = function(e) {
  e.data.text = $('#texttext').val();
  $(e.data.getNode().children()[0]).html(e.data.text);
  e.data.font = parseInt($('#textfont').val());
  e.data.getNode().css('font-family', fonts[e.data.font].font);
  e.data.fontSize = parseInt($('#textsize').val());
  e.data.getNode().css('font-size', parseInt(e.data.fontSize * 0.6) + 'px');
  e.data.color = rgb2hex($('#textcolor').css('background-color'));
  e.data.getNode().css('color', e.data.color);
};

Text.prototype.addToPane = function(paneId) {
  var node = $('<div class="elem text" id="' + this.id + '"><div class="innertext">' + this.text + '</div></div>');
  collection.getPane(paneId).getNode().append(node);
  node.css('width', this.width + '%');
  node.css('height', this.height + '%');
  node.css('z-index', this.z);
  node.css('left', this.left + "%")
      .css('top', this.top + "%");
  node.css('font-size', parseInt(this.fontSize * 0.6) + 'px');
  node.css('font-family', fonts[this.font].font);
  node.css('color', this.color);
};

function Img(paneId) {
  Elem.call(this, paneId);
  this.width = 50;
  this.height = 50;
  this.url = '';
  this.type = tools.IMAGE;
}

Img.prototype = new Elem();
Img.prototype.constructor = Img;

Img.prototype.copy = function(src) {
  this.pane = src.pane;
  this.id = src.id;
  this.z = src.z;
  this.width = src.width;
  this.height = src.height;
  this.url = src.url;
  this.left = src.left;
  this.top = src.top;
}

Img.prototype.showSettings = function() {
  var html = 'Select File: ';
  html += '<button id="imagepicker">Pick File</button><br />';
  html += '<button id="forward">Move To Front</button> <button id="back">Move To Back</button>';
  html += '<br /><button id="delete">Delete</button';
  var self = this;
  $('#elem-settings').html(html);
  $('#imagepicker').on('click', function() {
    filepicker.getFile('image/*', function(url, data){
      self.url = url + '?dl=false';
      self.updateElem({data: self});
    });
  });
  $('#forward').on('click', this, this.moveFront);
  $('#back').on('click', this, this.moveBack);
  $('#delete').on('click', this, this.deleteElem);
};

Img.prototype.updateElem = function(e) {
  e.data.getNode().css('background-image', 'url("' + e.data.url + '")');
};

Img.prototype.addToPane = function(paneId) {
  var node = $('<div class="elem image" id="' + this.id + '"></div>');
  collection.getPane(paneId).getNode().append(node);
  node.css('width', this.width + '%');
  node.css('height', this.height + '%');
  node.css('z-index', this.z);
  node.css('left', this.left + "%")
      .css('top', this.top + "%");
  node.css('background-image', 'url("' + this.url + '")');
};

function togglePreview() {
  if(collection.preview) {
    $('#preview').children()[0].innerHTML = "Preview";
    $('.pane').removeClass('preview');
    collection.preview = false;
    $('.nav').hide();
  } else {
    user.setCurrentElem(null);
    user.setCurrentTool(tools.NONE);
    $('#preview').children()[0].innerHTML = "Close";
    $('.pane').addClass('preview');
    collection.preview = true;
    $('.nav').show();
    if(collection.current === 0) {
      $('#navleft').hide();
    }
    if(collection.current === collection.ordering.length - 1) {
      $('#navright').hide();
    }
  }
}

function toggleTutorial() {
  if(collection.tutorial) {
    $('#tutorial').children()[0].innerHTML = "Show Tutorial";
    $('#tutorial_canvas').hide();
    collection.tutorial = false;
  } else {
    $('#tutorial').children()[0].innerHTML = "Hide Tutorial";
    collection.tutorial = true;
    $('#tutorial_canvas').show();
    user.setCurrentElem(null);
    user.setCurrentTool(tools.NONE);
    //start tut
    ctx.textAlign = "center";
    writeOnCanvas("Welcome to Foliomaker", 20, 400, 300);
    setTimeout(tutorialPhase2, 2000);
  }
}

function writeOnCanvas(text, font, x, y) {
  ctx.font = font + "px Amaranth";
  var width = ctx.measureText(text).width;
  ctx.fillStyle = "#1568B0";
  ctx.fillRect(x-width/2 - 10, y - font - 5, width + 20, font + 15);
  ctx.fillStyle = "white";
  ctx.fillText(text, x, y);
}

function tutorialPhase1() {
  ctx.clearRect(0, 0, 800, 600);
  writeOnCanvas("Click on these buttons when you're done designing your portfolio", 12, 630, 54);
  setTimeout(tutorialPhase11, 4000);
}

function tutorialPhase11() {
  ctx.clearRect(0, 0, 800, 600);
  writeOnCanvas("Show Source will give you the source code of your completed", 12, 630, 54);
  writeOnCanvas("portfolio, place the code into the specified files and you're done", 12, 630, 74);
  setTimeout(tutorialPhase12, 5000);
}

function tutorialPhase12() {
  ctx.clearRect(0, 0, 800, 600);
  writeOnCanvas("Save will give you a bunch of code. Keep it safe, so you can", 12, 630, 54);
  writeOnCanvas("come back later and load up your work and resume working on it", 12, 630, 74);
  setTimeout(toggleTutorial, 5000);
}

function tutorialPhase2() {
  ctx.clearRect(0, 0, 800, 600);
  writeOnCanvas("Click on any of these tools and then click on the pane", 12, 400, 100);
  writeOnCanvas("to add it to the pane (do not click and drag)", 12, 400, 120);
  setTimeout(tutorialPhase3, 5000);
}

function tutorialPhase3() {
  ctx.clearRect(0, 0, 800, 600);
  writeOnCanvas("Click on an element to select it. Once selected, you will be given options to modify it", 12, 400, 100);
  writeOnCanvas("You will then be able to click and drag the edges of the added component to resize it", 12, 400, 120);
  setTimeout(tutorialPhase4, 5000);
}

function tutorialPhase4() {
  ctx.clearRect(0, 0, 800, 600);
  writeOnCanvas("Click on Delete Pane if you want to get rid of the current pane (only works if there is more than 1)", 12, 400, 100);
  setTimeout(tutorialPhase5, 3000);
}

function tutorialPhase5() {
  ctx.clearRect(0, 0, 800, 600);
  writeOnCanvas("Click here to add more panes", 12, 700, 300);
  setTimeout(tutorialPhase1, 3000);
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
  $('#pane_window').append(elem);
  elem.delay(100).queue(function(next) {
    collection.rotateLeft();
  });
  pane.startHandlers();
}

function showSave() {
  if(collection.save === true) {
    collection.save = false;
    $('#save .topbar-dropdown').hide();
  } else {
    collection.save = true;
    $('#save .topbar-dropdown').show();
    user.setCurrentElem(null);
    user.setCurrentTool(tools.NONE);
    $('#savetext').val(JSON.stringify({user: user, collection: collection}));
  }
}

function showSource() {
  if(collection.source === true) {
    collection.source = false;
    $('#source .topbar-dropdown').hide();
  } else {
    collection.source = true;
    $('#source .topbar-dropdown').show();
    var css =
      '@import url(http://fonts.googleapis.com/css?family=Amaranth);\n' +
      '.pane {\n' +
        'position: fixed;\n' +
        '-moz-transition: all 0.7s;\n' +
        '-webkit-transition: all 0.7s;\n' +
      '}\n' +
      '\n' +
      '.pane.center {\n' +
        'top: 0%;\n' +
        'left: 0%;\n' +
        'bottom: 0%;\n' +
        'right: 0%;\n' +
        'z-index: 2;\n' +
      '}\n' +
      '\n' +
      '.pane.left {\n' +
        'top: 0%;\n' +
        'left: -100%;\n' +
        'bottom: 0%;\n' +
        'right: 100%;\n' +
        'z-index: 2;\n' +
      '}\n' +
      '\n' +
      '.pane.right {\n' +
        'top: 0%;\n' +
        'left: 100%;\n' +
        'bottom: 0%;\n' +
        'right: -100%;\n' +
        'z-index: 2;\n' +
      '}\n' +
      '\n' +
      '.elem {\n' +
        'overflow: hidden;\n' +
        'position: absolute;\n' +
        'background-size: cover;\n' +
        '-webkit-background-size: cover;\n' +
        '-moz-background-size: cover;\n' +
        'background-repeat: no-repeat;\n' +
      '}\n' +
      '\n' +
      '.nav {\n' +
        'position: fixed;\n' +
        'background-color: #FFF;\n' +
        'top: 0px;\n' +
        'bottom: 0px;\n' +
        'width: 50px;\n' +
        'opacity: 0.5;\n' +
        'z-index: 1000;\n' +
      '}\n' +
      '\n' +
      '.nav:hover {\n' +
        'opacity: 0.6;\n' +
        'cursor: pointer;\n' +
      '}\n' +
      '\n' +
      '.nav:active {\n' +
        'opacity: 0.8;\n' +
      '}\n' +

      '.nav.left {\n' +
        'left: 0px;\n' +
      '}\n' +

      '.nav.right {\n' +
        'right: 0px;\n' +
      '}\n' +

      '.hidden {\n' +
        'display: none;\n' +
      '}\n';
    for(var i in collection.ordering) {
      var pane = collection.panes[collection.ordering[i]];
      css += '#p' + pane.id + ' {\n';
      if(pane.backgroundType === backgrounds.COLOR) {
        css += 'background-color: ' + pane.backgroundColor + ';\n';
      } else {
        css += 'background-image: -webkit-linear-gradient(top, ' + hex2rgb(pane.backgroundGradient1) + ', ' + hex2rgb(pane.backgroundGradient2) + ');\n';
        css += 'background-image: -moz-linear-gradient(top, ' + hex2rgb(pane.backgroundGradient1) + ', ' + hex2rgb(pane.backgroundGradient2) + ');\n';
      }
      css += '}\n';
    }
    for(var j in collection.elems) {
      var elem = collection.elems[j];
      if(elem === null) {
        continue;
      }
      css += '#p' + elem.id + ' {\n';
      css += 'width: ' + elem.width + '%;\n';
      css += 'height: ' + elem.height + '%;\n';
      css += 'top: ' + elem.top + '%;\n';
      css += 'left: ' + elem.left + '%;\n';
      css += 'z-index: ' + elem.z + ';\n';
      switch(elem.type) {
        case tools.RECTANGLE:
          css += 'background-color: ' + elem.color + ';\n';
          css += 'opacity: ' + elem.opacity + ';\n';
          break;
        case tools.TEXT:
          css += 'color: ' + elem.color + ';\n';
          css += 'font-size: ' + elem.fontSize + 'px;\n';
          css += 'font-family: ' + fonts[elem.font].font + ';\n';
          break;
        case tools.IMAGE:
          css += 'background-image: url("' + elem.url + '");\n';
          break;
      }
      css += '}\n';
    }
    $('#sourcecss').val(css);
    var ordering = "[";
    for(var i in collection.ordering) {
      ordering += collection.ordering[i] + ',';
    }
    ordering = ordering.slice(0, ordering.length - 1);
    ordering += ']';
    var js =
      'var current = 0;\n' +
      'var ordering = ' + ordering + ';\n' +
      '\n' +
      '$(function() {\n' +
        '$("#navleft").on("click", function(e) {\n' +
          '$("#p" + ordering[current]).removeClass("center").addClass("right");\n' +
          '$("#p" + ordering[current - 1]).addClass("center").removeClass("left");\n' +
          'if(current == 1) {\n' +
            '$("#navleft").hide();\n' +
          '} else {\n' +
            '$("#navleft").show();\n' +
          '}\n' +
          'current--;\n' +
          '$("#navright").show();\n' +
        '});\n' +
        '$("#navright").on("click", function(e) {\n' +
          '$("#p" + ordering[current]).removeClass("center").addClass("left");\n' +
          '$("#p" + ordering[current + 1]).addClass("center").removeClass("right");\n' +
          'if(current == ordering.length - 2) {\n' +
            '$("#navright").hide();\n' +
          '} else {\n' +
            '$("#navright").show();\n' +
          '}\n' +
          'current++;\n' +
          '$("#navleft").show();\n' +
        '});\n' +
      '});\n';
    $('#sourcejs').val(js);
    var html =
      '<!DOCTYPE html>\n' +
      '<html>\n' +
      '<head>\n' +
      '<link rel="stylesheet" href="style.css">\n' +
      '</head>\n' +
      '<body>\n';
    var panehtml = [];
    for(var i in collection.ordering) {
      var pane = collection.panes[collection.ordering[i]];
      if(i == 0) {
        panehtml[pane.id] = '<div id="p' + pane.id + '" class="pane center">\n';
      } else {
        panehtml[pane.id] = '<div id="p' + pane.id + '" class="pane right">\n';
      }
    }
    for(var j in collection.elems) {
      var elem = collection.elems[j];
      if(elem === null) {
        continue;
      }
      switch(elem.type) {
        case tools.RECTANGLE:
          panehtml[elem.pane] += '<div id="p' + elem.id + '" class="elem"></div>\n';
          break;
        case tools.TEXT:
          panehtml[elem.pane] += '<div id="p' + elem.id + '" class="elem">' + elem.text + '</div>\n';
          break;
        case tools.IMAGE:
          panehtml[elem.pane] += '<div id="p' + elem.id + '" class="elem"></div>\n';
          break;
      }
    }

    for(var i in collection.ordering) {
      html += panehtml[collection.panes[collection.ordering[i]].id];
      html += '</div>\n';
    }
    html += '<div id="navleft" class="nav left hidden"></div>';
    if(collection.ordering.length > 1) {
      html += '<div id="navright" class="nav right"></div>';
    } else {
      html += '<div id="navright" class="nav right hidden"></div>';
    }
    html += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>\n';
    html += '<script src="script.js"></script>\n';
    html += "</body>\n</html>";
    $('#sourcehtml').val(html);
  }
}

function showTutorial() {
  
}
