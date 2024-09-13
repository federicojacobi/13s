class ListNode {
	constructor( d ) {
		this.d = d;
		this.n = null;
		this.p = null;
	}
}

export default class LinkedList {
	constructor() {
		this.head = null;
		this.tail = null;
		this.length = 0;
	}

	append( i ) {
		const n = new ListNode( i );
		if ( ! this.head ) {
			this.head = n;
			this.tail = n;
		} else {
			n.p = this.tail.p;
			this.tail.n = n;
		}
		this.length++;
	}

	preppend( i ) {
		const n = new ListNode( i );
		if ( ! this.head ) {
			this.head = n;
			this.tail = n;
		} else {
			n.n = this.head.n;
			this.head.n = n;
		}
		this.length++;
	}

	search( i ) {
		let current = this.head.n;
		do {
			if ( i === current.d ) {
				return current;
			}
			current = current.n;
		} while ( current !== null );
		return null;
	}

	remove( i ) {
		const el = this.search( i );
		if ( el ) {
			if ( el.p ) {
				el.p.n = el.n;
			}
			if ( el.n ) {
				el.n.p = el.p;
			}
			this.length--;
			return el;
		}
		return null;
	}
}