import "./setup"
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const fs = require('fs-promise')
let sinon = require('sinon')

import path from "path"
import { API3 } from "../src/api"
import { NodeReplacer } from "../src/replacer"
import assert from "assert"



function timeout(i: number) {
	return new Promise(resolve => setTimeout(resolve, i))
}

function createReplacer() {
	const api = new API3()
	return new NodeReplacer(api)
}

async function checkPage(beforePath: string, afterPath: string) {
	
	const before = new JSDOM(await fs.readFile(beforePath))
	const after = new JSDOM(await fs.readFile(afterPath))
	const replacer = createReplacer()
	await replacer.replace(before.window.document as Node)
	assert.strictEqual(before.window.document.body.textContent, after.window.document.body.textContent)
}

describe("replacer", () => {
	let oldFetch = (global as any).fetch
	let fetchStub: any;

	before(async function() {
		fetchStub = sinon.stub(global, "fetch")

		const response = new Response("<title>d000007 (James O'Bond)</title>", {
			status: 200,
			headers: {
				"Content-type": "text/html; charset=utf-8"
			}
		})	

		fetchStub
			.withArgs("https://github.wdf.sap.corp/d000007")
			.resolves(response)

			// Mock the text resolve function to not run into the problem of having an already usedBody
			sinon.stub(response, "text").resolves("<title>d000007 (James O&#39;Bond)</title>")
	})

	after(() => {
		(global as any).fetch = oldFetch
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
/*
	describe("watch", () => {
		const dom: any = new JSDOM(`<div></div>`)
		const replacer = createReplacer()
		replacer.watch(dom.window.document as Element)
		
		console.log()


		it("reacts to changing the text", async function() {
			const child = document.createElement("a")
			child.innerHTML = "d000007"
			dom.body.children[0].appendChild(child)
			await timeout(10)
			assert.strictEqual(child.innerHTML, "James Bond")
		})
	})
	*/
})
