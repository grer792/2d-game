const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

function preload() {}

function create() {
  this.add.text(400, 300, 'Game Ready!', {
    fontSize: '32px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

function update() {}
