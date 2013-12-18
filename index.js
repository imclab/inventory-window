// Generated by CoffeeScript 1.6.3
(function() {
  var EventEmitter, InventoryWindow, ever,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = (require('events')).EventEmitter;

  ever = require('ever');

  module.exports = InventoryWindow = (function(_super) {
    __extends(InventoryWindow, _super);

    function InventoryWindow(opts) {
      var _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
      if (opts == null) {
        opts = {};
      }
      this.inventory = (function() {
        if ((_ref = opts.inventory) != null) {
          return _ref;
        } else {
          throw 'inventory-window requires "inventory" option set to Inventory instance';
        }
      })();
      this.getTexture = (function() {
        if ((_ref1 = opts.getTexture) != null) {
          return _ref1;
        } else {
          throw 'inventory-window requires "getTexture" option set to callback';
        }
      })();
      this.width = (_ref2 = opts.width) != null ? _ref2 : 5;
      this.textureSize = (_ref3 = opts.textureSize) != null ? _ref3 : 16;
      this.borderSize = (_ref4 = opts.borderSize) != null ? _ref4 : 1;
      this.leftMouseButton = (_ref5 = opts.leftMouseButton) != null ? _ref5 : 0;
      this.rightMouseButton = (_ref6 = opts.rightMouseButton) != null ? _ref6 : 2;
      this.slotNodes = [];
      this.dragNode = null;
      this.dragSourceIndex = null;
      this.enable();
    }

    InventoryWindow.prototype.enable = function() {
      var _this = this;
      return ever(document).on('mousemove', function(ev) {
        if (!_this.dragNode) {
          return;
        }
        _this.dragNode.style.left = ev.x + 'px';
        return _this.dragNode.style.top = ev.y + 'px';
      });
    };

    InventoryWindow.prototype.createContainer = function() {
      var container, i, node, slotItem, widthpx, _i, _ref;
      container = document.createElement('div');
      for (i = _i = 0, _ref = this.inventory.size(); 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        slotItem = this.inventory.slot(i);
        node = this.createSlotNode(slotItem);
        this.bindSlotNodeEvent(node, i);
        this.slotNodes.push(node);
        container.appendChild(node);
      }
      widthpx = this.width * (this.textureSize + this.borderSize * 2);
      container.setAttribute('style', "border: 1px solid black;display: block;float: left;width: " + widthpx + "px;user-select: none;-moz-user-select: none;-webkit-user-select: none;transform: scale(5,5) translate(80px, 80px);-webkit-transform: scale(5,5) translate(80px, 80px);-moz-transform: scale(5,5) translate(80px, 80px);-ms-transform: scale(5,5) translate(80px, 80px);-o-transform: scale(5,5) translate(80px, 80px);");
      return container;
    };

    InventoryWindow.prototype.bindSlotNodeEvent = function(node, index) {
      var _this = this;
      return ever(node).on('mousedown', function(ev) {
        console.log('mousedown');
        if (_this.dragNode) {
          return _this.dropSlot(index, ev);
        } else {
          return _this.pickUpSlot(index, ev);
        }
      });
    };

    InventoryWindow.prototype.createSlotNode = function(itemPile) {
      var div, textNode;
      div = document.createElement('div');
      div.setAttribute('style', "border: " + this.borderSize + "px solid black;display: block;float: inherit;margin: 0;padding: 0;width: " + this.textureSize + "px;height: " + this.textureSize + "px;font-size: 5pt;");
      textNode = document.createTextNode();
      div.appendChild(textNode);
      this.populateSlotNode(div, itemPile);
      return div;
    };

    InventoryWindow.prototype.populateSlotNode = function(div, itemPile) {
      var src, text;
      if (itemPile != null) {
        src = this.getTexture(itemPile);
        text = itemPile.count;
        if (text === 1) {
          text = '';
        }
        if (text === Infinity) {
          text = '\u221e';
        }
      } else {
        src = void 0;
        text = '';
      }
      div.style.backgroundImage = src != null ? 'url(' + src + ')' : '';
      return div.textContent = text;
    };

    InventoryWindow.prototype.refreshSlotNode = function(index) {
      return this.populateSlotNode(this.slotNodes[index], this.inventory.array[index]);
    };

    InventoryWindow.prototype.pickUpSlot = function(index, ev) {
      var itemPile;
      itemPile = this.inventory.slot(index);
      console.log('pickUpSlot', index, itemPile);
      if (itemPile == null) {
        return;
      }
      this.populateSlotNode(this.slotNodes[index], void 0);
      this.dragSourceIndex = index;
      return this.createDragNode(itemPile, ev.x, ev.y);
    };

    InventoryWindow.prototype.createDragNode = function(itemPile, initialX, initialY) {
      this.dragNode = this.createSlotNode(itemPile);
      this.dragNode.setAttribute('style', this.dragNode.getAttribute('style') + ("position: absolute;left: " + initialX + "px;top: " + initialY + "px;user-select: none;-moz-user-select: none;-webkit-user-select: none;pointer-events: none;-webkit-transform: scale(5,5); /* TODO: stop scaling hack */"));
      return document.body.appendChild(this.dragNode);
    };

    InventoryWindow.prototype.removeDragNode = function() {
      this.dragNode.parentNode.removeChild(this.dragNode);
      this.dragNode = null;
      return this.dragSourceIndex = null;
    };

    InventoryWindow.prototype.dropSlot = function(index, ev) {
      var itemPile, newDragPile;
      itemPile = this.inventory.slot(index);
      console.log('dropSlot', index, itemPile);
      if (ev.button === this.rightMouseButton) {
        newDragPile = this.inventory.array[index].splitPile(-1);
        this.removeDragNode();
        this.createDragNode(newDragPile, ev.x, ev.y);
        return;
      } else {
        this.inventory.swap(this.dragSourceIndex, index);
      }
      if (this.dragSourceIndex != null) {
        this.refreshSlotNode(this.dragSourceIndex);
      }
      this.refreshSlotNode(index);
      this.removeDragNode();
    };

    return InventoryWindow;

  })(EventEmitter);

}).call(this);
