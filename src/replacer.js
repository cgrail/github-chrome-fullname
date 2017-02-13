// @flow
import { API3 } from "./api"

declare var NodeFilter: any

export class Replacer {
	__api: API3
	__idRegex: RegExp = /\b([di]\d{6}|c\d{7})\b/gi

	constructor(api: API3) {
		this.__api = api
	}
}

export class NodeReplacer extends Replacer {
	_restrictors: Array<(node: Node) => boolean> = []

	restrict(restrictor: (node: Node) => boolean) {
		this._restrictors.push(restrictor)
	}

	_checkRestriction(node: Node): boolean {
		return this._restrictors.reduce((a, b) => a && b(node), true)
	}

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

	async _handleChange(mutations: Array<MutationRecord>, _observer: MutationObserver) {
		const pending = []
		for(const { target } of mutations) {
			pending.push(this._replaceAll(target))
		}
		await Promise.all(pending)
	}

	async _replaceAll(element: Node) {
		const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
		const pending = []
		while(walker.nextNode()) {
			const { currentNode } = walker
			if(this._checkRestriction(currentNode)) {
				pending.push(this._replaceNode(currentNode))
			}
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
