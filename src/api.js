// @flow
import url from "url"

export class User {
	_user: Object

	constructor(user: Object) {
		this._user = user
	}

	getName(): string {
		return this._user.name + ""
	}

	getId(): string {
		return this._user.id + ""
	}
}

export class API3 {
	_root: string

	constructor(root: string) {
		this._root = url.resolve(root, "/api/v3")
	}

	getRoute(route: string) {
		return url.resolve(this._root, route)
	}

	async getUser(id: string): Promise<User> {

		const response = await fetch(this.getRoute(`users/${ id }`), {
			method: "GET",
			cache: "default"
		})

		return new User(await response.json())
	}
}
