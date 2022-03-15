// @flow
import "babel-polyfill"
import "isomorphic-fetch"
import { API3 } from "./api"
import { NodeReplacer } from "./replacer"

const api = new API3()
const replacer = new NodeReplacer(api)

replacer.watch(document.body)
replacer.watch(document.querySelector('title') as Element)

function triggerRelogin(): void {
    // Check if the user is logged in, if not the body has the css class 'logged-out'
    if (!document.body.classList.contains('logged-out')) {
        return
    }

    // check if an anchor (a-tag) exists which points towards "/login"
    const hasSignInLinkOnPage = document.querySelector("a[href^='/login']")
    if (!hasSignInLinkOnPage) {
        return
    }

    // If we are on the / or /login page we will directly trigger the login.
    // If we manually log out, we will land on /dashboard/logged_out
    // If the auto login fails, we land on /session
    const loginTriggerPaths = ["/", "/login"]
    const isPathLoginPath: boolean = loginTriggerPaths.includes(window.location.pathname)

    // check if the document has an element with the classes like the sing in button
    // This is essential if GitHub is in annoymous mode and allows user to browse without logging in
    const hasSignInLinkAndClassesMatch: boolean = ["HeaderMenu-link", "no-underline", "mr-3"]
        .reduce((doClassesMatch: boolean, currentClassName: string): boolean =>
            doClassesMatch && hasSignInLinkOnPage.classList.contains(currentClassName), true)

    // If we're either on a dedicated login path or if we see the sign in button we force a login
    if (isPathLoginPath || hasSignInLinkAndClassesMatch) {
        let encodedRedirectUri = encodeURIComponent(window.location.href)
        window.location.href = `/login?force_external=true&return_to=${encodedRedirectUri}`
    }
}

// Check if the current user is logged in and trigger a relogin if that is not the case
triggerRelogin()
