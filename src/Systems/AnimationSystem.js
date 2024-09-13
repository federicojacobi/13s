import { System } from "ant-ecs";
import { ANIMATION, SPRITE, TEXTURE } from "../constants";
import { ANIMATIONS } from "../helpers/Animations";

export default class AnimationSystem extends System {
	constructor() {
		super();
		console.log( 'Animation system ON' );
		this.query = e => e.components.has( ANIMATION ) && e.components.has( TEXTURE ) && e.components.has( SPRITE );
	}

	update( delta ) {
		this.ecs.query( this.query ).forEach( entity => {
			let state = entity.components.get( ANIMATION );
			let texture = entity.components.get( TEXTURE );
			let sprite = entity.components.get( SPRITE );
			let currentAnimationFrames = ANIMATIONS[ state.key ].frames;

			if ( state.elapsed >= currentAnimationFrames[ state.currentFrame ].duration ) {
				state.elapsed = 0;
				state.currentFrame++;
				if ( state.currentFrame === currentAnimationFrames.length ) {
					if ( state.loop ) {
						state.currentFrame = 0;
					} else {
						entity.components.delete( ANIMATION );
						return;
					}
				}
			} else {
				state.elapsed += delta;
			}

			texture.key = currentAnimationFrames[ state.currentFrame ].textureKey;
			sprite.width = currentAnimationFrames[ state.currentFrame ].width
			sprite.height = currentAnimationFrames[ state.currentFrame ].height
			sprite.textureOffsetX = currentAnimationFrames[ state.currentFrame ].textureOffsetX
			sprite.textureOffsetY = currentAnimationFrames[ state.currentFrame ].textureOffsetY
		} );
	}
}