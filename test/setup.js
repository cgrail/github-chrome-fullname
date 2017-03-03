// @flow
import "babel-polyfill"
import "isomorphic-fetch"
import jsdom from "jsdom"

class MutationRecord {
	target: Node
	constructor(target: Node) {
		this.target = target
	}
}

class MutationObserver {
	_handler: Function
	constructor(handler: Function) {
		this._handler = handler
	}

	observe(doc: any) {
		this._interseptAll("appendChild", doc.body)
	}
	_interseptAll(name: string, doc: any) {
		this._intersept(name, doc)
		for(const child of doc.children) {
			this._interseptAll(name, child)
		}
	}
	_intersept(name: string, doc: any) {
		const old = doc[name].bind(doc)
		doc[name] = (child, ...args) => {
			const record = new MutationRecord(child)
			this._handler([ record ])
			old(child, ...args)
		}
	}
}


if(typeof document === "undefined") {
    global.document = jsdom.jsdom("<html><body></body></html>")
    global.window = document.defaultView
    global.navigator = window.navigator
	global.window.MutationObserver = MutationObserver
}


