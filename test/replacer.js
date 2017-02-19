// @flow
import "./setup"
import { jsdom } from "jsdom"
import fs from "fs-promise"
import path from "path"
import { API3 } from "../src/api"
import { NodeReplacer } from "../src/replacer"
import assert from "assert"

function timeout(i: number) {
	return new Promise(resolve => setTimeout(resolve, i))
}

function createReplacer() {
	const api = new API3("https://github.wdf.sap.corp/")
	return new NodeReplacer(api)
}

async function checkPage(beforePath: string, afterPath: string) {
	const before = jsdom(await fs.readFile(beforePath))
	const after = jsdom(await fs.readFile(afterPath))
	const replacer = createReplacer()
	await replacer.replace(before)
	assert.strictEqual(before.body.innerHTML, after.body.innerHTML)
}

describe("replacer", () => {
	let oldFetch = global.fetch

	before(async function() {
		global.fetch = url => {
			if(url === "https://github.wdf.sap.corp/api/v3/users/d000007") {
				return new Response(JSON.stringify({"name": "James Bond"}), {
					status: 200,
					headers: {
						"Content-type": "application/json"
					}
				})
			}
		}
	})

	after(() => {
		global.fetch = oldFetch
	})

	describe("copy command line", () => {
		const beforePath = path.resolve(__dirname, "fixtures/copy-command-line-before.html")
		const afterPath = path.resolve(__dirname, "fixtures/copy-command-line-after.html")

		it("should replace all user ids", async function() {
			await checkPage(beforePath, afterPath)
		})
	})

	describe("github commits", () => {
		const beforePath = path.resolve(__dirname, "fixtures/github-commits-before.html")
		const afterPath = path.resolve(__dirname, "fixtures/github-commits-after.html")

		it("should replace all user ids", async function() {
			await checkPage(beforePath, afterPath)
		})
	})

	describe("pull request", () => {
		const beforePath = path.resolve(__dirname, "fixtures/pull-request-before.html")
		const afterPath = path.resolve(__dirname, "fixtures/pull-request-after.html")

		it("should replace all user ids", async function() {
			await checkPage(beforePath, afterPath)
		})
	})

	describe("watch", () => {
		const dom = jsdom`<div></div>`
		const replacer = createReplacer()
		replacer.watch(dom)


		it("reacts to changing the text", async function() {
			const child = document.createElement("a")
			child.innerHTML = "d000007"
			dom.body.children[0].appendChild(child)
			await timeout(10)
			assert.strictEqual(child.innerHTML, "James Bond")
		})
	})
})
