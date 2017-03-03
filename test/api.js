// @flow
import "./setup"
import assert from "assert"
import sinon from "sinon"
import { API3 } from "../src/api"



describe("api", () => {
	let server

	beforeEach(async function() {
		server = sinon.stub(global, "fetch")
		const res = new Response(JSON.stringify({"name": "Max Mustermann"}), {
			status: 200,
			headers: {
				"Content-type": "application/json"
			}
		})

		fetch
			.withArgs("http://github.wdf.sap.corp/api/v3/users/D000000")
			.returns(Promise.resolve(res))
	})

	afterEach(async function() {
		fetch.restore()
	})
	sinon.spy()
	const api = new API3("http://github.wdf.sap.corp/")

	it("getUser", async function() {
		const user = await api.getUser("D000000")
		assert(user.getName() === "Max Mustermann", "Username must be correct")
		assert(server.withArgs("http://github.wdf.sap.corp/api/v3/users/D000000").calledOnce)
	})
})
