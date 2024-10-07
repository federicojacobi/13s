import { scaffold } from "ant-ecs";
import { BODY, DAMAGE, POSITION, SPRITE, TEXT, TEXTURE } from "../constants";

export function TileFactory( x = 0, y = 0, vx = 0, vy = 0, u = 0, v = 0, damage = false ) {
	scaffold.create()
	.addComponent( POSITION, { x: x, y: y } )
	.addComponent( BODY, {
		vx: vx,
		vy: vy
	} )
	.addComponent( TEXTURE, { key: 'tileset' } )
	.addComponent( SPRITE, {
		textureOffsetX: u,
		textureOffsetY: v
	} );

	damage && scaffold.addComponent( DAMAGE );

	return scaffold.entity;
};

export function TextFactory( x, y, text, font = '', color = '#FFF' ) {
	scaffold
	.create()
	.addComponent( POSITION, { x: x, y: y } )
	.addComponent( BODY, {
		width: 1,
		height: 1,
		anchorX: 0,
		anchorY: 0
	} )
	.addComponent( TEXT, {
		content: text,
		font: font,
		fillStyle: color
	} );
	return scaffold.entity;
}