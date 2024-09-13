import { System } from "ant-ecs";
import { BODY, HOOK, POSITION, TEXT } from "../constants";
import { isOverlapping } from "../helpers/Utils";

export default class PickupSystem extends System {
	constructor() {
		super();
		this.zones = [];
	}
	setPlayer( p ) {
		this.player = p;
	}
	addZone( rect ) {
		this.zones.push( rect );
	}
	update( delta ) {
		const p = this.player;
		if ( p ) {
			const pos = p.components.get( POSITION );
			const body = p.components.get( BODY );

			const playerRect = {
				x: pos.x - body.width * body.anchorX,
				y: pos.y - body.height * body.anchorY,
				width: body.width,
				height: body.height
			};
			this.zones.forEach( rect => {
				if ( isOverlapping( playerRect, rect ) ) {
					rect.callback && rect.callback();
				}
			} );
		}
	}
}