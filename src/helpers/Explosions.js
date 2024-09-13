import { scaffold } from "ant-ecs";
import { ANIMATION, BODY, POSITION, SPRITE, TEXTURE } from "../constants";

export function generateExplosion( x, y, speed = 3, particles = 6 ) {
	const startAngle = Math.random() * Math.PI * 2;
	for ( let i = 0; i <= particles; i++ ) {
		const angle = ( Math.PI * 2 * i / particles ) + startAngle;

		scaffold.create()
		.addComponent( POSITION, {
			x: x,
			y: y
		} )
		.addComponent( BODY, {
			anchorX: 0.5,
			anchorY: 0.5,
			vx: Math.sin( angle ) * speed,
			vy: Math.cos( angle ) * speed
		} )
		.addComponent( ANIMATION, {
			key: 'explosion'
		} )
		.addComponent( TEXTURE, { key: 'tileset' } )
		.addComponent( SPRITE );

		const entity = scaffold.entity;
		this.ecs.jobs.add( 3, () => {
			this.ecs.killEntity( entity );
		} );
	}
}