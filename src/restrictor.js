// @flow

/**
 * Returns a function which checks of any parent fulfills the criteria defined by the check function.
 * E.g. Can be used to find out if any parent has a class XY
 */
function parents(check: (node: Element) => boolean) {
	return (node: Element | null | typeof undefined) => node ? check(node) || parents(check)(node.parentElement) : false
}

/**
 * Returns a functions which checks if the parent fulfills a certain criteria defined by the check function.
 * E.g. Can be used to check if the parent has a class XY
 */
function parent(check: (node: Element) => boolean) {
	return ({ parentElement }: Node) => parentElement ? check(parentElement) : false
}

/**
 * Returns a function which checks if the element itself or any parent fulfills a criteria.
 */
function inside(check: (node: Element) => boolean) {
	return (node: Element) => check(node) || parents(check)(node)
}

/**
 * Returns a function which checks if an element has a certain class.
 */
function className(className: string) {
	return ({ classList }: Element) => classList.contains(className)
}

/**
 * Returns a function which checks if an element has multiple defined classes.
 */
function classNames(classNames: Array<string>) {
	return ({ classList }: Element) =>
		classNames.reduce((a, b) => a && classList.contains(b), true)
}

/**
 * Returns a function which checks if an element has a certain tag name.
 * E.g. 
 * x = tagName("A")
 * if element is anchor: x(element) = true
 * else: x(element) = false
 */
function tagName(name: string) {
	return ({ tagName }: Element) => tagName.toLowerCase() === name.toLowerCase()
}

/**
 * Returns a function which checks if an element has a certain id.
 * E.g.
 * x = idName("myId")
 * if element has id myId: x(element) = true 
 * else: x(element) = false
 */
function idName(name: string) {
	return ({ id }: Element) => id === name
}

/**
 * Returns a function which requires to checks to be true.
 * E.g:
 * x = and(check1, check2)
 * if check1(element) && check2(element): x(element) = true
 * else x(element) = false
 */
function and(...checks: Array<(node: Element) => boolean>) {
	return (node: Element) => checks.reduce((a, b) => a && b(node), true)
}

/**
 * A restrictor can be used to define conditions.
 * If all conditions are met the check function returns true.
 * Else it returns false.
 * This can be used to define prerequisites for a replacer which must be met
 * in order to replace the user id of an element.
 */
export default class Restrictor {
	_restrictions: Array<(node: Element) => boolean> = []
	_exceptions: Array<(node: Element) => boolean> = []

	constructor() {
		this.restrict(inside(tagName("TEXTAREA")))
			.restrict(inside(tagName("PRE"))) // No replace for anything that is preformatted
			.restrict(inside(tagName("CODE"))) // No replace for anything which seems like code
			.restrict(inside(className("ace_editor")))
			.restrict(inside(className("form-content"))) // Edit comment text area
			.restrict(inside(className("commit-ref"))) // Visible remote branch name. It should be able to use this name in the terminal
			.restrict(inside(className("merge-pr-more-commits"))) // Comment for fork: Add more commits by pushing to the
			.restrict(inside(className("protip"))) // Exclude protip
			.restrict(inside(className("blob-wrapper"))) // exclude github blobs
			.restrict(inside(className("copyable-terminal"))) // UserIds which are commands
			.restrict(inside(className("js-live-clone-url")))
			.restrict(idName("simpleUserId"))
			.restrict(className("vcard-username"))
			.except(inside(and(tagName("A"), className("author"))))
	}

	/**
	 * Add a restriction.
	 * A restriction reduces the amount of elements of the image set of the restrictor.
	 * This means if the restriction is met the check function will return false.
	 */
	restrict(restriction: (node: Element) => boolean): Restrictor {
		this._restrictions.push(restriction)
		return this
	}

	/**
	 * Add an exception.
	 * An exception prevents an element to be affected by a restriction.
	 */
	except(exception: (node: Element) => boolean): Restrictor {
		this._exceptions.push(exception)
		return this
	}

	_checkExceptions(node: Element): boolean {
		return this._exceptions.reduce((a, b) => a || b(node), false)
	}

	_checkRestrictions(node: Element): boolean {
		return this._restrictions.reduce((a, b) => a && !b(node), true)
	}
	
	/**
	 * This function can be executed to check if an element is in the image set
	 * of the restrictor.
	 */
	check(node: Element): boolean {
		return this._checkExceptions(node) || this._checkRestrictions(node)
	}
}
