// @flow
import { API3 } from "./api"
import Restrictor from "./restrictor"

declare var NodeFilter: any

export class NodeReplacer {
	_api: API3
	_idRegex: RegExp = /\b([di]\d{6}|c\d{7})\b/gi
	_restrictor: Restrictor = new Restrictor

	constructor(api: API3) {
		this._api = api
	}


	async watch(element: Document) {
		await this.replace(element)
		const observer = new window.MutationObserver(this._handleChange.bind(this))
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
			pending.push(this.replace(target))
		}
		await Promise.all(pending)
	}

	async replace(element: Node) {
		const walker = document.createTreeWalker(element, window.NodeFilter.SHOW_TEXT)
		const pending = []
		while(walker.nextNode()) {
			const { currentNode } = walker
			// $FlowIgnore A text node must always have a parentElement
			if(this._restrictor.check(currentNode.parentElement)) {
				pending.push(this._replaceNode(currentNode))
			}
		}
		await Promise.all(pending)
	}

	async _replaceNode(node: Node) {
		if(!node.nodeValue) {
			return
		}
		const ids = node.nodeValue.match(this._idRegex) || []
		const pending = []
		for(const id of ids) {
			pending.push(this._replaceId(id, node))
		}
		await Promise.all(pending)
	}

	async _replaceId(id: string, node: Node) {
		const user = await this._api.getUser(id)
		node.nodeValue = node.nodeValue.replace(id, user.getName())
	}
}

