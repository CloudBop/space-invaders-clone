console.log('helpers.js');
//
//screen
function Screen(width, height) {
  //
  this.canvas = document.createElement('canvas');
  // interesting mutli assignment !!!
  this.canvas.width = this.width = width;
  this.canvas.width = this.width = width;
  // set ctx API
  this.ctx = this.canvas.getContext('2d');
  //
  document.body.appendChild(this.canvas);
}
Screen.prototype.drawSprite = function(sp, x, y) {
  this.ctx.drawImage(sp.img, sp.x, sp.y, sp.w, sp.h, x, y, sp.w, sp.h);
};

//sprite
function Sprite(img, x, y, w, h) {
  this.img = img;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
}

//handler
function InputHandler() {
  this.down = {};
  this.pressed = {};
  //
  var _this = this;
  document.addEventListener(
    'keydown',
    function(evt) {
      _this.down[evt.keyCode] = true;
    },
    false
  );
  //
  document.addEventListener(
    'keyup',
    function(evt) {
      delete _this.pressed[evt.keyCode];
      delete _this.pressed[evt.keyCode];
    },
    false
  );
  //
}

InputHandler.prototype.isDown = function(keyCode) {
  return this.down[keyCode];
};

InputHandler.prototype.isPressed = function(keyCode) {
  if (this.pressed[code]) {
    return false;
  } else if (this.down[code]) {
    return (this.pressed[code] = true);
  }
  return false;
};
