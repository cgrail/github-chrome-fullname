// @flow
import { API3 } from "./api"

declare var NodeFilter: any

export class Replacer {
	__api: API3
	__idRegex: RegExp = /[di]\d{6}|c\d{7}/gi

	constructor(api: API3) {
		this.__api = api
	}
}

export class NodeReplacer extends Replacer {
	async watch(element: HTMLElement) {
		await this._replaceAll(element)
		const observer = new MutationObserver(this._handleChange.bind(this))
		observer.observe(element, {
			childList: true,
			characterData: true,
			subtree: true
		})
		return this
	}

	async _replaceAll(element: HTMLElement) {
		const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
		const pending = []
		while(walker.nextNode()) {
			pending.push(this._replaceNode(walker.currentNode))
		}
		await Promise.all(pending)
	}
	async _handleChange(mutations: Array<MutationRecord>, _observer: MutationObserver) {
		const pending = []
		for(const { target } of mutations) {
			pending.push(this._replaceNode(target))
		}
		await Promise.all(pending)
	}

	async _replaceNode(node: Node) {
		if(!node.nodeValue) {
			return
		}
		const ids = node.nodeValue.match(this.__idRegex) || []
		const pending = []
		for(const id of ids) {
			const replacer = new IdReplacer(this.__api, id, node)
			pending.push(replacer.replace())
		}
		await Promise.all(pending)
	}
}

export class IdReplacer extends Replacer {
	_id: string
	_node: Node

	constructor(api: API3, id: string, node: Node) {
		super(api)
		this._id = id
		this._node = node
	}

	async replace() {
		const user = await this.__api.getUser(this._id)
		this._node.nodeValue = this._node.nodeValue.replace(this._id, user.getName())
	}
}
