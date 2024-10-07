import { System } from "ant-ecs";
import { ALIVE, BODY, DAMAGE, KEYBOARDCONTROL, POSITION, SPRITE, TEXTURE } from "../constants";
import { isOverlapping } from "../helpers/Utils";
export default class DamageSystem extends System {
	constructor() {
		super();
		console.log( 'Damage system ON' );
		this.deathCallback = null;
		this.query = e => e.components.has( DAMAGE );
	}

	setPlayer( p ) {
		this.player = p;
	}

	update( delta ) {
		if ( this.player && ! this.player.components.has( ALIVE ) ) {
			return;
		}
		this.ecs.query( this.query ).forEach( entity => {
			const pos = entity.components.get( POSITION );
			const body = entity.components.get( BODY );
			const pBody = this.player.components.get( BODY );
			const pPos = this.player.components.get( POSITION );

			const rectA = {
				x: pos.x - body.width * body.anchorX,
				y: pos.y - body.height * body.anchorY,
				width: body.width,
				height: body.height
			};
			const rectB = {
				x: pPos.x - pBody.width * pBody.anchorX,
				y: pPos.y - pBody.height * pBody.anchorY,
				width: pBody.width,
				height: pBody.height
			};
			if ( isOverlapping( rectA, rectB ) ) {
				this.deathCallback && this.deathCallback();
			}
		} );
	}
}