// @flow
import { NodeReplacer } from "./replacer"

export default function restrict(replacer: NodeReplacer) {
	// $FlowIgnore
	replacer.restrict((node: Node) => node.parentElement.nodeName === "A")

	return replacer
}
