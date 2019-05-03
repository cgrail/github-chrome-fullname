let sinon = require('sinon')


import assert from "assert"

import { API3 } from "../src/api"

describe("api", () => {
	let server: any;
	let oldFetch = (global as any).fetch

	beforeEach(async function() {
		server = sinon.stub(global, "fetch")
		const res = new Response("<title>D000000 (Max (Hans) Mustermann)</title>", {
			status: 200,
			headers: {
				"Content-type": "text/html; charset=utf-8"
			}
		})

		server
			.withArgs("https://github.wdf.sap.corp/D000000")
			.returns(Promise.resolve(res))
	})

	afterEach(async function() {
		(global as any).fetch = oldFetch
		server.reset()
	})
	sinon.spy()
	const api = new API3()

	it("getUser", async function() {
		const user = await api.getUser("D000000","github.wdf.sap.corp")
		assert(user.getName() === "Max (Hans) Mustermann", "Username must be correct")
		assert(server.withArgs("https://github.wdf.sap.corp/D000000").calledOnce)
	})
})
