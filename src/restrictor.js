// @flow

/**
 * Returns a function which checks of any parent fulfills the criteria defined by the check function.
 * E.g. Can be used to find out if any parent has a class XY
 */
function parents(check: (node: Node) => boolean): (node: Node) => boolean {
	return (node: Node) => node ? check(node) || parents(check)(node.parentElement) : false
}

/**
 * Returns a functions which checks if the parent fulfills a certain criteria defined by the check function.
 * E.g. Can be used to check if the parent has a class XY
 */
function parent(check: (node: Node) => boolean): (node: Node) => boolean {
	return (node: Node) => check(node.parentElement)
}

/**
 * Returns a function which checks if the element itself or any parent fulfills a criteria.
 */
function inside(check: (node: Node) => boolean): (node: Node) => boolean {
	return (node: Node) => check(node) || parents(check)(node)
}

/**
 * Returns a function which checks if an element has a certain class.
 */
function className(className: string): (node: Node) => boolean {
	return ({ classList }: Node) => classList.contains(className)
}

/**
 * Returns a function which checks if an element has multiple defined classes.
 */
function classNames(classNames: Array<string>): (node: Node) => boolean {
	return ({ classList }: Node) =>
		classNames.reduce((a, b) => classList.contains(a) && classList.contains(b))
}

/**
 * Returns a function which checks if an element has a certain tag name.
 * E.g. 
 * x = tagName("A")
 * if element is anchor: x(element) = true
 * else: x(element) = false
 */
function tagName(name: string): (node: Node) => boolean {
	return ({ tagName }: Node) => tagName.toLowerCase() === name.toLowerCase()
}

/**
 * Returns a function which checks if an element has a certain id.
 * E.g.
 * x = idName("myId")
 * if element has id myId: x(element) = true 
 * else: x(element) = false
 */
function idName(name: string): (node: Node) => boolean {
	return ({ id }: Node) => id === name
}

/**
 * Returns a function which requires to checks to be true.
 * E.g:
 * x = and(check1, check2)
 * if check1(element) && check2(element): x(element) = true
 * else x(element) = false
 */
function and(...checks: Array<(node: Node) => boolean>): (node: Node) => boolean {
	return (node: Node) => checks.reduce((a, b) => a(node) && b(node))
}

/**
 * A restrictor can be used to define conditions.
 * If all conditions are met the check function returns true.
 * Else it returns false.
 * This can be used to define prerequisites for a replacer which must be met
 * in order to replace the user id of an element.
 */
export default class Restrictor {
	_restrictions: Array<(node: Node) => boolean> = []
	_exceptions: Array<(node: Node) => boolean> = []

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
	restrict(restriction: (node: Node) => boolean): Restrictor {
		this._restrictions.push(restriction)
		return this
	}

	/**
	 * Add an exception.
	 * An exception prevents an element to be affected by a restriction.
	 */
	except(exception: (node: Node) => boolean): Restrictor {
		this._exceptions.push(exception)
		return this
	}

	_checkExceptions(node: Node): boolean {
		return this._exceptions.reduce((a, b) => a || b(node), false)
	}

	_checkRestrictions(node: Node): boolean {
		return this._restrictions.reduce((a, b) => a && !b(node), true)
	}
	
	/**
	 * This function can be executed to check if an element is in the image set
	 * of the restrictor.
	 */
	check(node: Node): boolean {
		return this._checkExceptions(node) || this._checkRestrictions(node)
	}
}
