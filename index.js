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
      var _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
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
      this.textureSize = (_ref3 = opts.textureSize) != null ? _ref3 : 16 * 5;
      this.borderSize = (_ref4 = opts.borderSize) != null ? _ref4 : 4;
      this.secondaryMouseButton = (_ref5 = opts.secondaryMouseButton) != null ? _ref5 : 2;
      this.slotNodes = [];
      this.heldNode = void 0;
      this.heldItemPile = void 0;
      this.container = void 0;
      this.resolvedImageURLs = {};
      this.enable();
    }

    InventoryWindow.prototype.enable = function() {
      var _this = this;
      ever(document).on('mousemove', function(ev) {
        if (!_this.heldNode) {
          return;
        }
        return _this.positionAtMouse(_this.heldNode, ev);
      });
      return this.inventory.on('changed', function() {
        return _this.refresh();
      });
    };

    InventoryWindow.prototype.createContainer = function() {
      var container, i, node, slotItem, widthpx, _i, _ref;
      container = document.createElement('div');
      for (i = _i = 0, _ref = this.inventory.size(); 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        slotItem = this.inventory.get(i);
        node = this.createSlotNode(slotItem);
        this.bindSlotNodeEvent(node, i);
        this.slotNodes.push(node);
        container.appendChild(node);
      }
      widthpx = this.width * (this.textureSize + this.borderSize * 2);
      container.setAttribute('style', "border: " + this.borderSize + "px solid black;display: block;float: left;width: " + widthpx + "px;user-select: none;-moz-user-select: none;-webkit-user-select: none;");
      return this.container = container;
    };

    InventoryWindow.prototype.bindSlotNodeEvent = function(node, index) {
      var _this = this;
      return ever(node).on('mousedown', function(ev) {
        return _this.clickSlot(index, ev);
      });
    };

    InventoryWindow.prototype.createSlotNode = function(itemPile) {
      var div, textNode;
      div = document.createElement('div');
      div.setAttribute('style', "border: " + this.borderSize + "px solid black;display: block;float: inherit;margin: 0;padding: 0;width: " + this.textureSize + "px;height: " + this.textureSize + "px;font-size: 20pt;background-size: 100% auto;image-rendering: -moz-crisp-edges;image-rendering: -o-crisp-edges;image-rendering: -webkit-optimize-contrast;image-rendering: crisp-edges;-ms-interpolation-mode: nearest-neighbor;");
      textNode = document.createTextNode('');
      div.appendChild(textNode);
      this.populateSlotNode(div, itemPile);
      return div;
    };

    InventoryWindow.prototype.populateSlotNode = function(div, itemPile) {
      var newImage, src, text;
      if ((itemPile != null) && itemPile.count > 0) {
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
      newImage = src != null ? 'url(' + src + ')' : '';
      if (this.resolvedImageURLs[newImage] !== div.style.backgroundImage) {
        div.style.backgroundImage = newImage;
        this.resolvedImageURLs[newImage] = div.style.backgroundImage;
      }
      if (div.textContent !== text) {
        return div.textContent = text;
      }
    };

    InventoryWindow.prototype.refreshSlotNode = function(index) {
      return this.populateSlotNode(this.slotNodes[index], this.inventory.array[index]);
    };

    InventoryWindow.prototype.refresh = function() {
      var i, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.inventory.size(); 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(this.refreshSlotNode(i));
      }
      return _results;
    };

    InventoryWindow.prototype.positionAtMouse = function(node, mouseEvent) {
      var x, y, _ref, _ref1;
      x = (_ref = mouseEvent.x) != null ? _ref : mouseEvent.clientX;
      y = (_ref1 = mouseEvent.y) != null ? _ref1 : mouseEvent.clientY;
      x -= this.textureSize / 2;
      y -= this.textureSize / 2;
      node.style.left = x + 'px';
      return node.style.top = y + 'px';
    };

    InventoryWindow.prototype.createHeldNode = function(itemPile, ev) {
      var style;
      if (this.heldNode) {
        this.removeHeldNode();
      }
      if (!itemPile || itemPile.count === 0) {
        this.heldItemPile = void 0;
        return;
      }
      this.heldItemPile = itemPile;
      this.heldNode = this.createSlotNode(this.heldItemPile);
      this.heldNode.setAttribute('style', style = this.heldNode.getAttribute('style') + "position: absolute;user-select: none;-moz-user-select: none;-webkit-user-select: none;pointer-events: none;");
      this.positionAtMouse(this.heldNode, ev);
      return document.body.appendChild(this.heldNode);
    };

    InventoryWindow.prototype.removeHeldNode = function() {
      this.heldNode.parentNode.removeChild(this.heldNode);
      this.heldNode = void 0;
      return this.heldItemPile = void 0;
    };

    InventoryWindow.prototype.clickSlot = function(index, ev) {
      var itemPile, oneHeld, tmp, _ref;
      itemPile = this.inventory.get(index);
      console.log('clickSlot', index, itemPile);
      if (ev.button !== this.secondaryMouseButton) {
        if (!this.heldItemPile) {
          this.heldItemPile = this.inventory.array[index];
          this.inventory.set(index, void 0);
        } else {
          if (this.inventory.array[index]) {
            if (this.inventory.array[index].mergePile(this.heldItemPile) === false) {
              tmp = this.heldItemPile;
              this.heldItemPile = this.inventory.array[index];
              this.inventory.set(index, tmp);
            }
          } else {
            this.inventory.set(index, this.heldItemPile);
            this.heldItemPile = void 0;
          }
        }
      } else {
        if (!this.heldItemPile) {
          this.heldItemPile = (_ref = this.inventory.array[index]) != null ? _ref.splitPile(0.5) : void 0;
        } else {
          if (this.inventory.array[index]) {
            oneHeld = this.heldItemPile.splitPile(1);
            if (this.inventory.array[index].mergePile(oneHeld) === false) {
              this.heldItemPile.increase(1);
              tmp = this.heldItemPile;
              this.heldItemPile = this.inventory.array[index];
              this.inventory.set(index, tmp);
            }
          } else {
            this.inventory.set(index, this.heldItemPile.splitPile(1));
          }
        }
      }
      this.createHeldNode(this.heldItemPile, ev);
      return this.refreshSlotNode(index);
    };

    return InventoryWindow;

  })(EventEmitter);

}).call(this);
