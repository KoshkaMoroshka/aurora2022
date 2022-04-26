import Vector from '../utils/vector';
import Player from './player';
import { Scene } from './scene';

export default class Fence extends Phaser.Physics.Arcade.Sprite {
	isClosed = true;
	auroraInCorral = false;
	colliderPlayer: Phaser.Physics.Arcade.Collider;
	colliderJelly: Phaser.Physics.Arcade.Collider;
	tiles = this.map.filterTiles((tile: Phaser.Tilemaps.Tile) => {
		return tile.index === this.tileIndexClose;
	});
	constructor(
		scene: Scene,
		position: Vector,
		size: Vector,
		readonly map: Phaser.Tilemaps.TilemapLayer,
		readonly tileIndexClose: number,
		readonly tileIndexOpen: number,
		readonly player: Player,
		readonly slimes: Phaser.Physics.Arcade.Group
	) {
		super(scene, position.x, position.y, 'none');
		scene.physics.world.enable(this, Phaser.Physics.Arcade.STATIC_BODY);
		scene.add.existing(this);
		this.body.setSize(size.x, size.y);
		this.visible = false;
		this.colliderPlayer = scene.physics.add.collider(player, this);
		this.colliderJelly = scene.physics.add.collider(slimes, this);
	}

	closeFence() {
		const _scene = this.scene;
		this.colliderPlayer = _scene.physics.add.collider(this.player, this);
		this.colliderJelly = _scene.physics.add.collider(this.slimes, this);
		this.isClosed = true;
		this.tiles.forEach(tile => (tile.index = this.tileIndexClose));
	}

	openFence() {
		const _scene = this.scene;
		_scene.physics.world.removeCollider(this.colliderPlayer);
		_scene.physics.world.removeCollider(this.colliderJelly);
		this.isClosed = false;
		this.tiles.forEach(tile => (tile.index = this.tileIndexOpen));
	}
}
