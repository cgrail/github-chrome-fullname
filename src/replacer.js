// @flow
import { API3 } from "./api"
import Restrictor from "./restrictor"

function timeout(time: number) {
	return new Promise(resolve => setTimeout(resolve, time))
}

declare var NodeFilter: any

export class NodeReplacer {
	_api: API3
	_idRegex: RegExp = /[di]\d{6}|c\d{7}/gi
	_restrictor: Restrictor = new Restrictor

	constructor(api: API3) {
		this._api = api
	}


	async watch(element: Element) {
		await this.replace(element)
		const observer = new window.MutationObserver(this._getChangeHandler())
		observer.observe(element, {
			childList: true,
			characterData: true,
			subtree: true
		})
		return this
	}

	_getChangeHandler() {
		return (mutations: Array<MutationRecord>, _observer: MutationObserver) => {
			for(const { target } of mutations) {
				this.replace(target)
			}
		}
	}

	async replace(element: Node) {
		console.info("start replacing")
		const start = Date.now()
		const walker = document.createTreeWalker(element, window.NodeFilter.SHOW_TEXT)
		const pending = []
		let x = 0
		while(walker.nextNode()) {
			if(++x === 500) {
				x = 0
				await timeout(0)
			}
			const { currentNode } = walker
			pending.push(this._replaceNode(currentNode))
		}
		await Promise.all(pending)
		console.info(`finished replacing in ${ Date.now() - start } milliseconds`)
	}

	_blurNode({ parentElement }: Node) {
		if(parentElement instanceof window.HTMLElement) {
			parentElement.style.filter = "blur(0.8px)"
		}
	}

	_unblurNode({ parentElement }: Node) {
		if(parentElement instanceof window.HTMLElement) {
			parentElement.style.filter = ""
		}
	}

	async _replaceNode(node: Node) {
		if(!node.nodeValue) {
			return
		}
		const ids = node.nodeValue.match(this._idRegex) || []
		if(ids.length <= 0 || !this._restrictor.check(node.parentElement)) {
			return
		}
		const pending = []
		for(const id of ids) {
			pending.push(this._replaceId(id, node))
		}
		this._blurNode(node)
		await Promise.all(pending)
		this._unblurNode(node)
	}

	async _replaceId(id: string, node: Node) {
		const user = await this._api.getUser(id)
		node.nodeValue = node.nodeValue.replace(id, user.getName())
	}
}

