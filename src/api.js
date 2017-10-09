// @flow
import url from "url"

export class User {
	_user: Object

	constructor(user: Object) {
		this._user = user
	}

	getName(): string {
		if (this._user && this._user.name) {
			return this._user.name;
		}
		return "";
	}

	getId(): string {
		return this._user.id + ""
	}
}

export class API3 {
	_root: string

	constructor(root: string) {
		this._root = url.resolve(root, "/api/v3/")
	}

	_getRoute(route: string) {
		return url.resolve(this._root, route)
	}

	async getUser(id: string): Promise<User> {
		let data = {
			id,
			name: id
		}
		try {
			const response = await fetch(this._getRoute(`users/${ id }`), {
				method: "GET",
				cache: "force-cache"
			})
			data = await response.json()
		} catch(e) {
			console.error(`Could not get user ${ id }`)
		}

		return new User(data)
	}
}
