// @flow
import "babel-polyfill"
import "isomorphic-fetch"
import { API3 } from "./api"
import { NodeReplacer } from "./replacer"
import restrict from "./restrict"

const api = new API3("https://github.wdf.sap.corp/")
const replacer = new NodeReplacer(api)
restrict(replacer)

replacer.watch(document)
