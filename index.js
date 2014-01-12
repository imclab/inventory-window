// Generated by CoffeeScript 1.6.3
(function() {
  var EventEmitter, InventoryWindow, ever,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = (require('events')).EventEmitter;

  ever = require('ever');

  module.exports = InventoryWindow = (function(_super) {
    __extends(InventoryWindow, _super);

    InventoryWindow.heldItemPile = void 0;

    InventoryWindow.heldNode = void 0;

    InventoryWindow.mouseButtonDown = void 0;

    InventoryWindow.resolvedImageURLs = {};

    function InventoryWindow(opts) {
      var _ref, _ref1, _ref10, _ref11, _ref12, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
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
      this.linkedInventory = opts.linkedInventory;
      this.getTexture = (_ref1 = opts.getTexture) != null ? _ref1 : InventoryWindow.defaultGetTexture;
      this.registry = opts.registry;
      if ((this.getTexture == null) && (this.registry == null)) {
        throw 'inventory-window: required "getTexture" or "registry" option missing';
      }
      this.getMaxDamage = (_ref2 = opts.getMaxDamage) != null ? _ref2 : InventoryWindow.defaultGetMaxDamage;
      this.inventorySize = (_ref3 = opts.inventorySize) != null ? _ref3 : this.inventory.size();
      this.width = (_ref4 = opts.width) != null ? _ref4 : this.inventory.width;
      this.height = (_ref5 = opts.height) != null ? _ref5 : this.inventory.height;
      this.textureSize = (_ref6 = opts.textureSize) != null ? _ref6 : 16 * 5;
      this.borderSize = (_ref7 = opts.borderSize) != null ? _ref7 : 4;
      this.progressThickness = (_ref8 = opts.progressThickness) != null ? _ref8 : 10;
      this.secondaryMouseButton = (_ref9 = opts.secondaryMouseButton) != null ? _ref9 : 2;
      this.allowDrop = (_ref10 = opts.allowDrop) != null ? _ref10 : true;
      this.allowPickup = (_ref11 = opts.allowPickup) != null ? _ref11 : true;
      this.allowDragPaint = (_ref12 = opts.allowDragPaint) != null ? _ref12 : true;
      this.progressColorsThresholds = opts.progressColorsThresholds != null ? opts.progressColorsThresholds : opts.progressColorsThresholds = [0.20, 0.40, Infinity];
      this.progressColors = opts.progressColors != null ? opts.progressColors : opts.progressColors = ['red', 'orange', 'green'];
      this.slotNodes = [];
      this.container = void 0;
      this.selectedIndex = void 0;
      this.enable();
    }

    InventoryWindow.prototype.enable = function() {
      var _this = this;
      ever(document).on('mousemove', function(ev) {
        if (!InventoryWindow.heldNode) {
          return;
        }
        return _this.positionAtMouse(InventoryWindow.heldNode, ev);
      });
      ever(document).on('mouseup', function(ev) {
        return InventoryWindow.mouseButtonDown = void 0;
      });
      return this.inventory.on('changed', function() {
        return _this.refresh();
      });
    };

    InventoryWindow.prototype.createContainer = function() {
      var container, heightpx, i, node, slotItem, widthpx, _i, _ref;
      container = document.createElement('div');
      for (i = _i = 0, _ref = this.inventorySize; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        slotItem = this.inventory.get(i);
        node = this.createSlotNode(slotItem);
        this.setBorderStyle(node, i);
        this.bindSlotNodeEvent(node, i);
        this.slotNodes.push(node);
        container.appendChild(node);
      }
      widthpx = this.width * (this.textureSize + this.borderSize * 2);
      heightpx = this.height * (this.textureSize + this.borderSize);
      container.setAttribute('style', "border: " + this.borderSize + "px solid black;display: block;float: left;width: " + widthpx + "px;height: " + heightpx + "px;user-select: none;-moz-user-select: none;-webkit-user-select: none;");
      return this.container = container;
    };

    InventoryWindow.prototype.bindSlotNodeEvent = function(node, index) {
      var _this = this;
      ever(node).on('mousedown', function(ev) {
        return _this.clickSlot(index, ev);
      });
      return ever(node).on('mouseover', function(ev) {
        if (!_this.allowDragPaint) {
          return;
        }
        if (!_this.allowDrop) {
          return;
        }
        if (InventoryWindow.heldItemPile == null) {
          return;
        }
        if (InventoryWindow.mouseButtonDown !== _this.secondaryMouseButton) {
          return;
        }
        _this.dropOneHeld(index);
        _this.createHeldNode(InventoryWindow.heldItemPile, ev);
        return _this.refreshSlotNode(index);
      });
    };

    InventoryWindow.prototype.createSlotNode = function(itemPile) {
      var div;
      div = document.createElement('div');
      div.setAttribute('style', "display: inline-block;float: inherit;margin: 0;padding: 0;width: " + this.textureSize + "px;height: " + this.textureSize + "px;font-size: 20pt;background-size: 100% auto;image-rendering: -moz-crisp-edges;image-rendering: -o-crisp-edges;image-rendering: -webkit-optimize-contrast;image-rendering: crisp-edges;-ms-interpolation-mode: nearest-neighbor;");
      this.populateSlotNode(div, itemPile);
      return div;
    };

    InventoryWindow.prototype.populateSlotNode = function(div, itemPile, isSelected) {
      var maxDamage, newImage, progress, progressColor, progressNode, src, text, textBox, _ref;
      src = void 0;
      text = '';
      progress = void 0;
      progressColor = void 0;
      if (itemPile != null) {
        if (this.registry != null) {
          src = this.registry.getItemPileTexture(itemPile);
        } else if (this.getTexture != null) {
          src = this.getTexture(itemPile);
        } else {
          throw 'inventory-window textures not specified, set InventoryWindow.defaultGetTexture or pass "getTexture" or "registry" option';
        }
        text = itemPile.count;
        if (text === 1) {
          text = '';
        }
        if (text === Infinity) {
          text = '\u221e';
        }
        if (((_ref = itemPile.tags) != null ? _ref.damage : void 0) != null) {
          if (this.registry != null) {
            maxDamage = this.registry.getItemProps(itemPile.item).maxDamage;
          } else if (this.getMaxDamage != null) {
            maxDamage = this.getMaxDamage(itemPile);
          } else {
            maxDamage = 100;
          }
          progress = (maxDamage - itemPile.tags.damage) / maxDamage;
          progressColor = this.getProgressBarColor(progress);
        }
      }
      newImage = src != null ? 'url(' + src + ')' : '';
      if (InventoryWindow.resolvedImageURLs[newImage] !== div.style.backgroundImage) {
        div.style.backgroundImage = newImage;
        InventoryWindow.resolvedImageURLs[newImage] = div.style.backgroundImage;
      }
      textBox = div.children[0];
      if (textBox == null) {
        textBox = document.createElement('div');
        textBox.setAttribute('style', 'position: absolute');
        div.appendChild(textBox);
      }
      if (textBox.textContent !== text) {
        textBox.textContent = text;
      }
      progressNode = div.children[1];
      if (progressNode == null) {
        progressNode = document.createElement('div');
        progressNode.setAttribute('style', "width: 0%;top: " + (this.textureSize - this.borderSize * 2) + "px;position: relative;visibility: hidden;");
        div.appendChild(progressNode);
      }
      if (progressColor != null) {
        progressNode.style.borderTop = "" + this.progressThickness + "px solid " + progressColor;
      }
      if (progress != null) {
        progressNode.style.width = (progress * 100) + '%';
      }
      return progressNode.style.visibility = progress != null ? '' : 'hidden';
    };

    InventoryWindow.prototype.getProgressBarColor = function(progress) {
      var i, threshold, _i, _len, _ref;
      _ref = this.progressColorsThresholds;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        threshold = _ref[i];
        if (progress <= threshold) {
          return this.progressColors[i];
        }
      }
      return this.progressColors.slice(-1)[0];
    };

    InventoryWindow.prototype.setBorderStyle = function(node, index) {
      if (index === this.selectedIndex) {
        return node.style.border = "" + this.borderSize + "px dotted black";
      } else {
        return node.style.border = "" + this.borderSize + "px solid black";
      }
    };

    InventoryWindow.prototype.setSelected = function(index) {
      this.selectedIndex = index;
      return this.refresh();
    };

    InventoryWindow.prototype.getSelected = function(index) {
      return this.selectedIndex;
    };

    InventoryWindow.prototype.refreshSlotNode = function(index) {
      this.populateSlotNode(this.slotNodes[index], this.inventory.get(index));
      return this.setBorderStyle(this.slotNodes[index], index);
    };

    InventoryWindow.prototype.refresh = function() {
      var i, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.inventorySize; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
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
      if (InventoryWindow.heldNode) {
        this.removeHeldNode();
      }
      if (!itemPile || itemPile.count === 0) {
        InventoryWindow.heldItemPile = void 0;
        return;
      }
      InventoryWindow.heldItemPile = itemPile;
      InventoryWindow.heldNode = this.createSlotNode(InventoryWindow.heldItemPile);
      InventoryWindow.heldNode.setAttribute('style', style = InventoryWindow.heldNode.getAttribute('style') + "position: absolute;user-select: none;-moz-user-select: none;-webkit-user-select: none;pointer-events: none;z-index: 10;");
      this.positionAtMouse(InventoryWindow.heldNode, ev);
      return document.body.appendChild(InventoryWindow.heldNode);
    };

    InventoryWindow.prototype.removeHeldNode = function() {
      InventoryWindow.heldNode.parentNode.removeChild(InventoryWindow.heldNode);
      InventoryWindow.heldNode = void 0;
      return InventoryWindow.heldItemPile = void 0;
    };

    InventoryWindow.prototype.dropOneHeld = function(index) {
      var oneHeld, tmp;
      if (this.inventory.get(index)) {
        oneHeld = InventoryWindow.heldItemPile.splitPile(1);
        if (this.inventory.get(index).mergePile(oneHeld) === false) {
          InventoryWindow.heldItemPile.increase(1);
          tmp = InventoryWindow.heldItemPile;
          InventoryWindow.heldItemPile = this.inventory.get(index);
          return this.inventory.set(index, tmp);
        } else {
          return this.inventory.changed();
        }
      } else {
        return this.inventory.set(index, InventoryWindow.heldItemPile.splitPile(1));
      }
    };

    InventoryWindow.prototype.clickSlot = function(index, ev) {
      var itemPile, shiftDown, tmp, _ref, _ref1;
      itemPile = this.inventory.get(index);
      console.log('clickSlot', index, itemPile);
      InventoryWindow.mouseButtonDown = ev.button;
      shiftDown = ev.shiftKey;
      if (ev.button !== this.secondaryMouseButton) {
        if (!InventoryWindow.heldItemPile || !this.allowDrop) {
          if (!this.allowPickup) {
            return;
          }
          if (InventoryWindow.heldItemPile != null) {
            if (this.inventory.get(index) != null) {
              if (!InventoryWindow.heldItemPile.canPileWith(this.inventory.get(index))) {
                return;
              }
              InventoryWindow.heldItemPile.mergePile(this.inventory.get(index));
            }
          } else {
            if (!shiftDown) {
              InventoryWindow.heldItemPile = this.inventory.get(index);
              this.inventory.set(index, void 0);
            } else if (this.linkedInventory && (this.inventory.get(index) != null)) {
              this.linkedInventory.give(this.inventory.get(index));
              if (this.inventory.get(index).count === 0) {
                this.inventory.set(index, void 0);
              }
              this.inventory.changed();
            }
          }
          this.emit('pickup');
        } else {
          if (this.inventory.get(index)) {
            if (this.inventory.get(index).mergePile(InventoryWindow.heldItemPile) === false) {
              tmp = InventoryWindow.heldItemPile;
              InventoryWindow.heldItemPile = this.inventory.get(index);
              this.inventory.set(index, tmp);
            } else {
              this.inventory.changed();
            }
          } else {
            this.inventory.set(index, InventoryWindow.heldItemPile);
            InventoryWindow.heldItemPile = void 0;
          }
        }
      } else {
        if (!InventoryWindow.heldItemPile) {
          if (!this.allowPickup) {
            return;
          }
          InventoryWindow.heldItemPile = (_ref = this.inventory.get(index)) != null ? _ref.splitPile(0.5) : void 0;
          if (((_ref1 = this.inventory.get(index)) != null ? _ref1.count : void 0) === 0) {
            this.inventory.set(index, void 0);
          }
          this.inventory.changed();
          this.emit('pickup');
        } else {
          if (!this.allowDrop) {
            return;
          }
          this.dropOneHeld(index);
        }
      }
      this.createHeldNode(InventoryWindow.heldItemPile, ev);
      return this.refreshSlotNode(index);
    };

    return InventoryWindow;

  })(EventEmitter);

}).call(this);
