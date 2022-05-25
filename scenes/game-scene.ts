/// <reference path='./module_types.d.ts'/>
import EasyStar from 'easystarjs';

import tilemapPng from '../assets/tileset/Green_Meadow_Tileset.png';
import tilemapJson from '../assets/green_meadow.json';
import CharacterFactory, {
} from '../src/characters/character_factory';
import { Scene } from '../src/characters/scene';
import Vector from '../src/utils/vector';

type LayerDescription = {
	depth?: number;
	collide?: boolean;
};

export class GameScene extends Phaser.Scene implements Scene {
	public readonly finder = new EasyStar.js();

	tileSize = 36;
	constructor() {
		super({ key: 'Game' });
	}

	width = 0;
	height = 0;
	characterFactory?: CharacterFactory;

	getSize() {
		return Vector.create(this.width, this.height);
	}

	preload() {
		this.load.image('tiles', tilemapPng);
		this.load.tilemapTiledJSON('map', tilemapJson);
	}

	generateNoise(density: number) {
		var rand = Math.floor((Math.random() * 100) + 1);
		if (density < rand)
			return 0;
		else
			return 1;
	}

	getSurroundingWallCount(gridX: number, gridY: number, grid: number[][], stateCell: number) {

		let wallCount: number = 0;

		for (let neighbourX = gridX - 1; neighbourX <= gridX + 1; neighbourX++) {
			for (let neighbourY = gridY - 1; neighbourY <= gridY + 1; neighbourY++) {
				if (neighbourX >= 0 && neighbourY >= 0 && neighbourX < grid.length && neighbourY < grid[0].length) {
					if (neighbourX != gridX && neighbourY != gridY) {
						if (grid[neighbourX][neighbourY] == stateCell) {
							wallCount++;
						}
					}
				} else {
					wallCount++;
				}
			}
		}

		return wallCount;
	}

	applyCellularAutomation(grid: number[][]) {

		let buffer_grid: number[][] = [];
		for (let i: number = 0; i < grid.length; i++) {
			buffer_grid[i] = [];
			for (let j: number = 0; j < grid[i].length; j++) {
				buffer_grid[i][j] = grid[i][j];
			}
		}

		for (let i = 0; i < grid.length; i++) {
			for (let j = 0; j < grid[i].length; j++) {
				var neighbours = this.getSurroundingWallCount(i, j, grid, 1);
				if (neighbours > 4 && buffer_grid[i][j] == 0) {
					buffer_grid[i][j] = 1;
				} else if (neighbours < 3 && buffer_grid[i][j] == 1) {
					buffer_grid[i][j] = 0;
				}
			}
		}

		return buffer_grid;
	}

	dilate(grid: number[][]) {
		let buffer_grid: number[][] = [];
		for (let i: number = 0; i < grid.length; i++) {
			buffer_grid[i] = [];
			for (let j: number = 0; j < grid[i].length; j++) {
				buffer_grid[i][j] = grid[i][j];
			}
		}

		//Написать дилатацию
		for (var i = 0; i < grid.length; i++) {
			for (var j = 0; j < grid[i].length; j++) {
				if (grid[i][j] == 1) {
					for (let neighbourX = i - 1; neighbourX <= i + 1; neighbourX++) {
						for (let neighbourY = j - 1; neighbourY <= j + 1; neighbourY++) {
							if (neighbourX >= 0 && neighbourY >= 0 && neighbourX < grid.length && neighbourY < grid[0].length) {
								buffer_grid[neighbourX][neighbourY] = 1;
							}
						}
					}
				}
			}
		}

		return buffer_grid;
	}

	erode(gridX: number, griY: number) {
		//Написать эрозию
	}

	create() {
		var array: number[][] = [];
		for (var i: number = 0; i < 50; i++) {
			array[i] = [];
			for (var j: number = 0; j < 50; j++) {
				array[i][j] = 0;
			}
		}

		const map = this.make.tilemap({ data: array });

		const tileset = map.addTilesetImage('Green_Meadow_Tileset', 'tiles', 32, 32, 2, 6);
		//const layers = createLayers(map, tileset, layersSettings);
		const layer = map.createBlankLayer('floor', tileset);

		this.width = map.widthInPixels;
		this.height = map.heightInPixels;

		this.physics.world.bounds.width = map.widthInPixels;
		this.physics.world.bounds.height = map.heightInPixels;

		var things: number[][] = [];

		for (var i: number = 0; i < map.width; i++) {
			things[i] = [];
			for (var j: number = 0; j < map.height; j++) {
				if (i == 0 || i == map.width - 1 || j == 0 || j == map.height - 1) {
					things[i][j] = 1;
				} else
					things[i][j] = this.generateNoise(60);
			}
		}


		layer.putTilesAt(things, 0, 0);


		// Creating characters
		const characterFactory = new CharacterFactory(this);
		this.characterFactory = characterFactory;

		characterFactory.buildPlayerCharacter('aurora', 800, 300);

		this.input.keyboard.on('keydown-O', () => {

			things = this.applyCellularAutomation(things);
			console.log(things);
			layer.putTilesAt(things, 0, 0);

		});

		this.input.keyboard.on('keydown-Z', () => {
			layer.replaceByIndex(0, 5);
			layer.replaceByIndex(1, -1);
		});
		this.input.keyboard.on('keydown-X', () => {
			layer.replaceByIndex(5, 0);
			layer.replaceByIndex(-1, 1);
		});

		this.input.keyboard.on('keydown-D', () => {
			things = this.dilate(things);
			layer.putTilesAt(things, 0, 0);
		});
		this.input.keyboard.on('keydown-E', () => {

		});

		this.input.keyboard.on('keydown-R', () => {
			let density = Math.floor((Math.random() * 100) + 1);
			for (var i: number = 0; i < map.width; i++) {
				things[i] = [];
				for (var j: number = 0; j < map.height; j++) {
					if (i == 0 || i == map.width - 1 || j == 0 || j == map.height - 1) {
						things[i][j] = 1;
					} else
						things[i][j] = this.generateNoise(density);
				}
			}
			layer.putTilesAt(things, 0, 0);
		});
	}

	update() {
		if (this.characterFactory) {

			this.characterFactory.gameObjects.forEach(function (element) {
				element.update();
			});
		}
	}

	tilesToPixels(tile: { x: number; y: number }): Phaser.Math.Vector2 {
		return new Phaser.Math.Vector2(
			tile.x * this.tileSize,
			tile.y * this.tileSize
		);
	}

	pixelsToTiles(pixels: { x: number; y: number }): Phaser.Math.Vector2 {
		return new Phaser.Math.Vector2(
			Math.floor(pixels.x / this.tileSize),
			Math.floor(pixels.y / this.tileSize)
		);
	}
}
