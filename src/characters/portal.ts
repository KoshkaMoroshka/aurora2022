import Phaser from 'phaser';
import Slime from './slime';

export default class Portal extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		name: string,
		frame: number,
		private timeToClose: number,
		public capacity: number,
		readonly animations: string[]
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this);
		scene.add.existing(this);
	}
	timer = 0;
	count = 0;

	slimes: Slime[] = [];

	addSlime(input: Slime) {
		if (this.count < this.capacity) {
			this.slimes.push(input);
			this.count += 1;
			return true;
		}
		return false;
	}

	// destroyPortalWithoutSlime() {
	// 	this.slimes.forEach(element => {
	// 		element.taskStart();
	// 	});
	// 	this.destroy();
	// }

	update() {
		if (this.count === this.capacity) {
			if (this.timer > this.timeToClose) {
				this.slimes.forEach(element => {
					element.destroy();
				});
				this.destroy();
			} else this.timer += 1;
		}
	}
}
