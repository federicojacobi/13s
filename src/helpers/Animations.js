const ANIMATIONS = {
	'idle': {
		frames: [
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17 * 6,
				textureOffsetY: 17 * 4,
				duration: 0.5
			},
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17 * 6,
				textureOffsetY: 17 * 5,
				duration: 2
			}
		]
	},
	'walkRight': {
		frames: [
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17 * 6,
				textureOffsetY: 17 * 2,
				duration: 0.125
			},
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17 * 6,
				textureOffsetY: 17 * 3,
				duration: 0.125
			}
		]
	},
	'explosion': {
		frames: [
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 0,
				textureOffsetY: 0,
				duration: 1/24
			},{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17,
				textureOffsetY: 0,
				duration: 1/24
			},{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17 * 2,
				textureOffsetY: 0,
				duration: 1/24
			},{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17 * 3,
				textureOffsetY: 0,
				duration: 1/24
			},
		]
	},
	'implosion': {
		frames: [
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17 * 3,
				textureOffsetY: 0,
				duration: 1/12
			},
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17 * 2,
				textureOffsetY: 0,
				duration: 1/12
			},
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17,
				textureOffsetY: 0,
				duration: 1/12
			},
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 0,
				textureOffsetY: 0,
				duration: 1/12
			},
		]
	},
	'grapplePickup': {
		frames: [
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17 * 4,
				textureOffsetY: 17 * 5,
				duration: 1/8
			},
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17 * 4,
				textureOffsetY: 17 * 6,
				duration: 1/8
			},
		]
	},
	'saw': {
		frames: [
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17 * 3,
				textureOffsetY: 17 * 4,
				duration: 1/8
			},
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17 * 3,
				textureOffsetY: 17 * 5,
				duration: 1/8
			},
		]
	},
	'water': {
		frames: [
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17,
				textureOffsetY: 17,
				duration: 1/8
			},
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17 * 2,
				textureOffsetY: 17 * 6,
				duration: 1/8
			},
		]
	},
	'fireworks': {
		frames: [
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17 * 5,
				textureOffsetY: 17,
				duration: 1/16
			},
			{
				textureKey: 'tileset',
				width: 16,
				height: 16,
				textureOffsetX: 17 * 6,
				textureOffsetY: 17,
				duration: 1/16
			},
		]
	}
}

export { ANIMATIONS };
