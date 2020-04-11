//
// - Global variables and functions
//
var display, input, frames, spFrame, lvFrame;
var alienSp, shipSp, shieldSp;
var aliens, dir, ship, bullets, shields;

function main() {
  display = new Screen(504, 600);
  input = new InputHandler();
  var img = new Image();
  img.addEventListener('load', function name(argument) {
    // alien sprites, in pairs
    alienSp = [
      // img, x, y, w, h
      [ new Sprite(this, 0, 0, 22, 16), new Sprite(this, 0, 16, 22, 16) ],
      [ new Sprite(this, 22, 0, 16, 16), new Sprite(this, 22, 16, 16, 16) ],
      [ new Sprite(this, 38, 0, 24, 16), new Sprite(this, 38, 16, 24, 16) ]
    ];
    //
    shipSp = new Sprite(this, 62, 0, 22, 16);
    shieldSp = new Sprite(this, 84, 8, 36, 24);
    //
    init();
    run();
  });
  img.src = 'res/invaders.png';
}

function init() {
  frames = 0;
  spFrame = 0;
  lvFrame = 60;
  dir = 1;
  //
  ship = {
    sprite: shipSp,
    x: (display.width - shipSp.w) / 2,
    y: display.height - (30 + shipSp.h)
  };
  // store bullets
  bullets = [];
  // store shields
  shields = {
    canvas: null,
    y: ship.y - (30 + shieldSp.h),
    h: shieldSp.h,
    init: function() {
      this.canvas = document.createElement('canvas');
      this.canvas.width = display.width;
      this.canvas.height = this.h;
      this.ctx = this.canvas.getContext('2d');

      for (var i = 0; i < 4; i++) {
        //(504-60)=444 remove 30 from either side to get width
        // 444/4 = 111 divide by 4
        // (111-36)/2 (36=width of shield) =37.5 round up
        // + 30 for offset
        this.ctx.drawImage(
          shieldSp.img,
          shieldSp.x,
          shieldSp.y,
          shieldSp.w,
          shieldSp.h,
          68 + 111 * i,
          0,
          shieldSp.w,
          shieldSp.h
        );
      }
    },
    generateDamage: function(x, y) {
      // round down+*2
      x = Math.floor(x / 2) * 2;
      y = Math.floor(y / 2) * 2;

      this.ctx.clearRect(x - 2, y - 2, 4, 4);
      this.ctx.clearRect(x + 2, y - 4, 2, 4);
      this.ctx.clearRect(x + 4, y, 2, 2);
      this.ctx.clearRect(x + 2, y + 2, 2, 2);
      this.ctx.clearRect(x - 4, y + 2, 2, 2);
      this.ctx.clearRect(x - 6, y, 2, 2);
      this.ctx.clearRect(x - 4, y - 4, 2, 2);
      this.ctx.clearRect(x - 2, y - 6, 2, 2);
    },
    // x,y is display
    hits: function(x, y) {
      // get coord of local ctx
      y -= this.y;
      // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
      // remove 1px
      var data = this.ctx.getImageData(x, y, 1, 1);
      // transparency layer
      if (data.data[3] !== 0) {
        this.generateDamage(x, y);
        return true;
      }
      return false;
    }
  };
  shields.init();
  // store aliens
  aliens = [];
  // alien formation pattern
  var rows = [ 1, 0, 0, 2, 2 ];
  for (let i = 0, len = rows.length; i < len; i++) {
    // const element = array[index];
    //
    for (let j = 0; j < 10; j++) {
      // const element = array[index];
      var a = rows[i];
      aliens.push({
        sprite: alienSp[a],
        // add 4px to smaller pink sprite.
        x: 30 + j * 30 + [ 0, 4, 0 ][a],
        y: 30 + i * 30,
        w: alienSp[a][0].w,
        h: alienSp[a][0].h
      });
      // draw ar 18:38
    }
  }
}

function run(arguments) {
  var loop = function(arguments) {
    update();
    render();
    //
    window.requestAnimationFrame(loop, display.canvas);
  };
  window.requestAnimationFrame(loop, display.canvas);
}

function update() {
  // SHIP
  // left
  if (input.isDown(37)) {
    ship.x -= 4;
    // console.log('ship', ship)
  }
  // right
  if (input.isDown(39)) {
    ship.x += 4;
    // console.log('ship', ship)
  }
  //
  ship.x = Math.max(Math.min(ship.x, display.width - (30 + shipSp.w)), 30);

  // BULLET try is down for auto-fire
  if (input.isPressed(32)) {
    bullets.push(new Bullet(ship.x + 10, ship.y, -8, 2, 6, '#fff'));
  }
  for (let i = 0, len = bullets.length; i < len; i++) {
    //
    var b = bullets[i];
    //
    b.update();
    // remove bullet to save memory
    if (b.y + b.height < 0 || b.y > display.height) {
      bullets.splice(i, 1);
      i--;
      len--;
      continue;
    }
    // shield damage
    var h2 = b.height * 0.5;
    if (shields.y < b.y + h2 && b.y + h2 < shields.y + shields.h) {
      // if bullet hits shield
      if (shields.hits(b.x, b.y + h2)) {
        bullets.splice(i, 1);
        i--;
        len--;
      }
    }
    //
    for (let j = 0, len2 = aliens.length; j < len2; j++) {
      var a = aliens[j];
      // if bullet hits alien
      if (AABBIntersect(b.x, b.y, b.width, b.height, a.x, a.y, a.w, a.h)) {
        // remove alien
        aliens.splice(j, 1);
        j--;
        len2--;
        // remove bullet;
        bullets.splice(i, 1);
        i--;
        len--;
        // change speed of alien movmt
        switch (len2) {
          case 30: {
            this.lvFrame = 40;
            break;
          }
          case 10: {
            this.lvFrame = 20;
            break;
          }
          case 5: {
            this.lvFrame = 15;
            break;
          }
          case 1: {
            this.lvFrame = 6;
            break;
          }
        }
      }
    }
  }
  // random aliens shoot
  if (Math.random() < 0.03 && aliens.length > 0) {
    var a = aliens[Math.round(Math.random() * (aliens.length - 1))];
    //
    for (let i = 0, len = aliens.length; i < len; i++) {
      var b = aliens[i];
      if (AABBIntersect(a.x, a.y, a.w, 100, b.x, b.y, b.w, b.h)) {
        a = b;
      }
    }
    bullets.push(new Bullet(a.x + a.w * 0.5, a.y + a.h, 4, 2, 4, '#ffff00'));
  }
  //
  frames++;
  // ALIENS
  if (frames % lvFrame === 0) {
    // = every second
    //
    var _max = 0,
      _min = display.width;
    //
    spFrame = (spFrame + 1) % 2;
    // iterate over aliens
    for (let i = 0, len = aliens.length; i < len; i++) {
      var a = aliens[i];
      // dir = 1 move to right || -1 move to left
      a.x += 30 * dir;
      //
      _max = Math.max(_max, a.x + a.w);
      _min = Math.min(_min, a.x);
    }
    // bounds move down and change direction
    if (_max > display.width - 30 || _min < 30) {
      // invert direction
      dir *= -1;
      // iterate aliens
      for (let i = 0, len = aliens.length; i < len; i++) {
        aliens[i].x += 30 * dir;
        aliens[i].y += 30;
      }
    }
  }
}

function render() {
  // refresh display render
  display.clear();
  //
  for (let i = 0, len = aliens.length; i < len; i++) {
    var a = aliens[i];
    // spFrame 0 || 1 - movement animation
    display.drawSprite(a.sprite[spFrame], a.x, a.y);
  }
  //
  display.ctx.save();
  for (let i = 0, len = bullets.length; i < len; i++) {
    display.drawBullet(bullets[i]);
  }
  display.ctx.restore();
  //
  display.ctx.drawImage(shields.canvas, 0, shields.y);
  display.drawSprite(ship.sprite, ship.x, ship.y);
}
//
document.onload(function() {
  main();
});
