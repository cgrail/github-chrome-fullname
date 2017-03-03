// @flow
import "./setup"
import Restrictor from "../src/restrictor"
import assert from "assert"

function elem(html: Array<string>) {
	const x = document.createElement("div")
	x.innerHTML = html[0]
	assert(x.children.length === 1)
	return x.children[0]
}

describe("restrictor", () => {
	const restrictor = new Restrictor


	it("return false if no element is provided", () => {
		assert(restrictor.check(null) === false)
		assert(restrictor.check(undefined) === false)
	})

	it("normal element should be allowed to replace", () => {
		const e = elem`<div>Ragnar Lothbrok</div>`
		assert(restrictor.check(e))
	})

	it("normal element should be allowed to replace", () => {
		const e = elem`<span class="css-truncate-target" id="simpleUserId">d000007</span>`
		assert(restrictor.check(e))
	})

	it("not allowed to replace an element which is part of a formContent.", () => {
		const form = elem`<form class="form-content"></form>`
		const label = elem`<span>Place</span>`
		const target = elem`<span>Karthegard</span>`
		form.appendChild(label)
		form.appendChild(target)
		assert(restrictor.check(target) === false)
	})

	it("should not be allowed to replace an element which is a vcard", () => {
		const parent = elem`<div class="commit-meta vcard-username"></div>`

		const target = elem`<a
				href="/d000007/testGithubSample/commits/master?author=d000007"
				aria-label="View all commits by Jesse James"
				class="commit-author tooltipped tooltipped-s"
				rel="author"
				id="vcardUserName"
				>
				d000007
			</a>`

		const time = elem`<time datetime="2015-03-07T01:40:18Z" is="relative-time">
			Mar 6, 2015
		</time>`

		parent.appendChild(target)
		parent.appendChild(time)
		assert(restrictor.check(target) === false)
	})

	it("should not be allowed to replace content which is intended for the command line", () => {
		const parent = elem`<pre
			class="copyable-terminal-content
			js-selectable-text
			js-zeroclipboard-target"
			id="gitCheckoutCommand">
				git checkout -b d000007-master master
				git pull
				<span class="js-live-clone-url">
					https://github.corporate/d000007/TestProject.git
				</span>
				 master
		</pre>`

		const child = parent.children[0]

		assert(restrictor.check(parent) === false)
		assert(restrictor.check(child) === false)
	})

	it("should allow to replace user id in the comment block of the pull request code tab", () => {
		const e = elem`<a
			href="/D012345"
			class="author link-gray-dark"
			id="testAuthorLink">
				Floki
		</a>`

		assert(restrictor.check(e))
	})

	it("every author in a link should be replaced even though it is restricted", () => {
		const e = elem`<div>not restricted</div>`
		const restrictor2 = new Restrictor

		restrictor2
			.restrict(() => true)
			.except(() => true)

		assert(restrictor2.check(e))
	})
})
