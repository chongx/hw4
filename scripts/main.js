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
  {text: 'Amaranth', font: 'amaranth, serif'},
  {text: 'Times New Roman', font: '"Times New Roman", Serif'}
];

var user = {
  nextId: 0,
  genId: function() {
    console.log(user.nextId);
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
    var overlay = $('#elem-overlay');
    var settingsLeft = elem.getNode().position().left + elem.getNode().width() + 20;
    var settingsTop = elem.getNode().position().top;
    settings.css('left', settingsLeft + 'px');
    settings.css('top', settingsTop + 'px');
    overlay.css('left', (elem.getNode().position().left - 2) + 'px');
    overlay.css('top', (elem.getNode().position().top - 2) + 'px');
    overlay.css('width', elem.getNode().width() + 'px');
    overlay.css('height', elem.getNode().height() + 'px');
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
    }
/*    for(var j in collection.elems) {
      collection.elems[j].addToPane(collection.elems[j].paneId);
    }*/
    var elem_settings = $('<div id="elem-settings"></div>');
    var elem_overlay = $('<div id="elem-overlay"></div>');
    collection.getCurrent().getNode().append(elem_settings);
    collection.getCurrent().getNode().append(elem_overlay);
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
    node.addClass('offleft');
  } else {
    node.addClass('offright');
  }
  if(this.backgroundType === backgrounds.COLOR) {
    this.setBackground(this.backgroundType, this.backgroundColor);
  } else {
    this.setBackground(this.backgroundType, this.backgroundGradient1, this.backgroundGradient2);
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
    this.getNode().css('background-image', '-webkit-linear-gradient(bottom, ' + hex2rgb(this.backgroundGradient1) + ', ' + hex2rgb(this.backgroundGradient2) + ')');
    this.getNode().css('background-image', '-moz-linear-gradient(bottom, ' + hex2rgb(this.backgroundGradient1) + ', ' + hex2rgb(this.backgroundGradient2) + ')');
  }
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
}

Rectangle.prototype = new Elem();
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.showSettings = function() {
  var html = 'Color: <div id="rectcolor" class="colorSelector" style="background-color: ' + this.color + '"></div><br />Opacity: <input id="rectopacity" type="text" style="width: 20px;" /><br /><br />';
  html += '<button id="forward">Move To Front</button> <button id="back">Move To Back</button>';
  html += '<br /><br /><button id="delete">Delete</button';
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
};

function Text(paneId) {
  Elem.call(this, paneId);
  this.width = 10;
  this.height = 20;
  this.text = 'Enter your text here';
  this.fontSize = 12;
  this.font = 0;
  this.color = '#000000';
}
Text.prototype = new Elem();
Text.prototype.constructor = Text;
Text.prototype.showSettings = function() {
  var html = 'Text: <br /><textarea id="texttext">' + this.text + '</textarea><br />';
  html += 'Font: <select id="textfont">';
  for(var i in fonts) {
    html += '<option value="' + i + '">' + fonts[i].text + '</option>';
  }
  html += '</select><br />';
  html += 'Size: <input type="text" id="textsize" value="40" style="width: 20px" />px<br />';
  html += 'Color: <div id="textcolor" class="colorSelector" style="background-color: ' + this.color + '"></div><br /><br />';
  html += '<button id="forward">Move To Front</button> <button id="back">Move To Back</button>';
  html += '<br /><br /><button id="delete">Delete</button';
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
};

function Img(paneId) {
  Elem.call(this, paneId);
  this.width = 50;
  this.height = 50;
  this.url = '';
}

Img.prototype = new Elem();
Img.prototype.constructor = Img;

Img.prototype.showSettings = function() {
  var html = 'Select File: ';
  html += '<button id="imagepicker">Pick File</button><br /><br /><br />';
  html += '<button id="forward">Move To Front</button> <button id="back">Move To Back</button>';
  html += '<br /><br /><button id="delete">Delete</button';
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
  console.log(e.data);
  e.data.getNode().css('background-image', 'url("' + e.data.url + '")');
};

Img.prototype.addToPane = function(paneId) {
  var node = $('<div class="elem image" id="' + this.id + '"></div>');
  collection.getPane(paneId).getNode().append(node);
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
