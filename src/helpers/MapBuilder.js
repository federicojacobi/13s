import { scaffold } from "ant-ecs";
import { ANIMATION, BODY, COLLIDER, DAMAGE, POSITION, SPRITE, TEXTURE } from "../constants";

const map = {
	width: 0,
	height: 0,
	data: [],
	entities: []
};

const setTile = ( x, y, tile, layer = 0 ) => {
	const i = Math.floor( y ) * map.width + Math.floor( x );
	if ( tile > 0 ) {
		const bodyProps = {
			width: 1,
			height: 1,
			immovable: true
		};
		scaffold.create()
		.addComponent( POSITION, { x: x, y: y } )
		.addComponent( BODY, bodyProps )
		.addComponent( COLLIDER, {} )
		.addComponent( TEXTURE, { key: 'tileset' } )
		.addComponent( SPRITE, {
			width: 16,
			height: 16,
			textureOffsetX: 17 * ( ( tile - 1 ) % 7 ),
			textureOffsetY: 17 * Math.floor( ( tile - 1 ) / 7 )
		} );
		if ( [ 19, 26, 32, 39, 46 ].indexOf( tile ) > -1 ) {
			scaffold.addComponent( DAMAGE );
		}
		if ( tile == 45 ) {
			scaffold.addComponent( ANIMATION, { key: 'water' } );
		}
		if ( tile == 32 ) {
			scaffold.addComponent( ANIMATION, { key: 'saw' } );
		}
		layer == 0 ? map.data[ i ] = tile:'';
		map.entities[ i ] = scaffold.entity;
	} else {
		map.data[ i ] = 0;
		map.entities[ i ] = null;
		return map.entities[ i ];
	}
}
const getTile = ( x, y ) => map.data[ Math.floor( y ) * map.width + Math.floor( x ) ];
const getTileEntity = ( x, y ) => map.entities[ Math.floor( y ) * map.width + Math.floor( x ) ];
export { setTile, getTile, getTileEntity };

/**
 * 
 * @param {*} JSON Tiled map 
 */
const mapBuilder = function( json ) {
	map.width = json.width;
	map.height = json.height;
	map.data = json.layers[0].data; // Layer 0 is solids
	for ( let i = 0; i < json.width * json.height; i++ ) {
		map.entities.push( null );
	}

	json.layers.forEach( ( layer, layerIndex ) => {
		const data = layer.data;
		for ( let y = 0; y < json.height; y++ ) {
			for ( x = 0; x < json.width; x++ ) {
				const tile = data[ y * json.width + x ];
				if ( tile > 0 ) {
					setTile( x, y, tile, layerIndex );
				}
			}
		}
	} );
}
export default mapBuilder;