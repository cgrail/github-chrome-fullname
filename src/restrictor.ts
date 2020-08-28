// @flow

/**
 * Returns a function which checks of any parent fulfills the criteria
 * defined by the check function.
 * E.g. Can be used to find out if any parent has a class XY
 */
function parents(check: (node: Element) => boolean): any {
    return (node: Element | null | typeof undefined) =>
        node ? check(node) || parents(check)(node.parentElement) : false
}

/**
 * Returns a function which checks if the element itself or any parent
 * fulfills a criteria.
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
 * Returns a function which requires to checks to be true.
 * E.g:
 * x = and(check1, check2)
 * if check1(element) && check2(element): x(element) = true
 * else x(element) = false
 */
function and(...checks: ((node: Element) => boolean)[]) {
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
    private _restrictions: ((node: Element) => boolean)[] = []
    private _exceptions: ((node: Element) => boolean)[] = []

    public constructor() {
        this.restrict(inside(tagName("TEXTAREA")))
            // No replace for anything that is preformatted
            .restrict(inside(tagName("PRE")))
            // No replace for anything which seems like code
            .restrict(inside(tagName("CODE")))
            .restrict(inside(className("ace_editor")))
            // Edit comment text area
            .restrict(inside(className("form-content")))
            // Visible remote branch name.
            // It should be able to use this name in the terminal
            .restrict(inside(className("commit-ref")))
            // Comment for fork: Add more commits by pushing to the
            .restrict(inside(className("merge-pr-more-commits")))
            // Signed commit popup: GPG key ID
            .restrict(inside(className("signed-commit-footer")))
            // Exclude protip
            .restrict(inside(className("protip")))
            // exclude github blobs
            .restrict(inside(className("blob-wrapper")))
            // UserIds which are commands
            .restrict(inside(className("copyable-terminal")))
            .restrict(inside(className("js-live-clone-url")))
            .restrict(inside(className("vcard-username")))
            // Preserves branch names in repository branch dropdown with names that contain user id
            .restrict(inside(and(tagName("A"), className("select-menu-item"))))
            // Preserves branch names in branches view of repository at repo/branches
            .restrict(inside(and(tagName("A"), className("branch-name"))))
            // Preserves in delete dialog
            .restrict(inside(className("Box-body")))
            .except(inside(and(tagName("A"), className("author"))))
    }

    /**
     * Add a restriction.
     * A restriction reduces the amount of elements of the image set of the restrictor.
     * This means if the restriction is met the check function will return false.
     */
    public restrict(restriction: (node: Element) => boolean): Restrictor {
        this._restrictions.push(restriction)
        return this
    }

    /**
     * Add an exception.
     * An exception prevents an element to be affected by a restriction.
     */
    public except(exception: (node: Element) => boolean): Restrictor {
        this._exceptions.push(exception)
        return this
    }

    private _checkExceptions(node: Element): boolean {
        return this._exceptions.reduce((a: boolean, b) => {
            return a || b(node);
        }, false)
    }

    private _checkRestrictions(node: Element): boolean {
        return this._restrictions.reduce((a: boolean, b) => a && !b(node), true)
    }

    /**
     * This function can be executed to check if an element is in the image set
     * of the restrictor.
     */
    public check(node: Element | null | typeof undefined): boolean {
        return node ? this._checkExceptions(node) || this._checkRestrictions(node) : false
    }
}
