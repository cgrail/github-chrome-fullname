import "babel-polyfill"
import "isomorphic-fetch"
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

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
		doc[name] = (child: Element, ...args: any[]) => {
			const record = new MutationRecord(child)
			this._handler([ record ])
			old(child, ...args)
		}
	}
}


if(typeof document === "undefined") {
	const dom = new JSDOM("<html><body></body></html>", { url: "https://github.wdf.sap.corp"})
	// @ts-ignore
	global.document = dom.window.document
	
//	global.MutationObserver = MutationObserver
	// @ts-ignore
	global.window = dom.window
	// @ts-ignore
	global.navigator = dom.window.navigator
}


