let sinon = require('sinon')


import assert from "assert"

import { API3 } from "../src/api"

describe("api", () => {
	let fetchStub: any;
	let oldFetch = (global as any).fetch
	let responseText = "<title>D000000 (Max (Hans) Mustermann D000000)</title>"

	beforeEach(async function () {
		fetchStub = sinon.stub(global, "fetch")
		const response = new Response()

		fetchStub
			.withArgs("https://github.wdf.sap.corp/D000000")
			.resolves(response)

		// Mock the text resolve function to not run into the problem of having an already usedBody
		sinon.stub(response, "text").resolves(responseText)
	})

	afterEach(async function () {
		(global as any).fetch = oldFetch
		fetchStub.reset()
	})
	sinon.spy()
	

	it("getUser", async function () {
		const api = new API3()
		const user = await api.getUser("D000000", "github.wdf.sap.corp")
		assert(user.getName() === "Max (Hans) Mustermann", "Username must be correct")
		assert(fetchStub.withArgs("https://github.wdf.sap.corp/D000000").calledOnce)
	})
	
	it("getUser - with enriched title", async function () {
		responseText = "<title>D000000 (Max (Hans) Mustermann D000000) · GitHub</title>"
		
		const api = new API3()
		const user = await api.getUser("D000000", "github.wdf.sap.corp")
		assert(user.getName() === "Max (Hans) Mustermann", "Username must be correct")
		assert(fetchStub.withArgs("https://github.wdf.sap.corp/D000000").calledOnce)
	})

	it("getUserCache", async function () {
		const api = new API3()
		const user = await api.getUser("D000000", "github.wdf.sap.corp")
		const user2 = await api.getUser("D000000", "github.wdf.sap.corp")
		assert(user.getName() === "Max (Hans) Mustermann", "Username must be correct")
		assert(fetchStub.withArgs("https://github.wdf.sap.corp/D000000").calledOnce, "GitHub should only be called once")
	})
})
