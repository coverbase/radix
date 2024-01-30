export type Node<T> = {
	value?: T;
	parameter?: string;
	children: Record<string, Node<T>>;
};

export class Radix<T> {
	rootNode: Node<T>;

	constructor() {
		this.rootNode = createNode();
	}

	insert = (key: string, value: T) => {
		let node = this.rootNode;

		for (const segment of key.split("/")) {
			const isParameter = segment.startsWith(":");
			const path = isParameter ? ":" : segment;

			let childNode = node.children[path];

			if (childNode === undefined) {
				childNode = isParameter
					? createNode(segment.substring(1))
					: createNode();

				node.children[path] = childNode;
			}

			node = childNode;
		}

		node.value = value;
	};

	match = (key: string, parameters: Record<string, string>): T | undefined => {
		let node = this.rootNode;

		for (const segment of key.split("/")) {
			const childNode = node.children[segment] ?? node.children[":"];

			if (childNode) {
				node = childNode;

				if (node.parameter) {
					parameters[node.parameter] = segment;
				}
			}
		}

		return node.value;
	};

	merge = (radix: Radix<T>) => {
		this.rootNode = combineNodes(this.rootNode, radix.rootNode);
	};
}

export const createNode = <T>(parameter?: string): Node<T> => {
	return {
		parameter,
		children: {},
	};
};

export const combineNodes = <T>(
	firstNode: Node<T>,
	secondNode: Node<T>,
): Node<T> => {
	const combinedNode = createNode<T>();

	combinedNode.value =
		firstNode.value !== undefined ? firstNode.value : secondNode.value;

	combinedNode.parameter =
		firstNode.parameter !== undefined
			? firstNode.parameter
			: secondNode.parameter;

	for (const key of new Set([
		...Object.keys(firstNode.children),
		...Object.keys(secondNode.children),
	])) {
		const firstChild = firstNode.children[key];
		const secondChild = secondNode.children[key];

		if (firstChild && secondChild) {
			combinedNode.children[key] = combineNodes(firstChild, secondChild);
		} else if (firstChild) {
			combinedNode.children[key] = firstChild;
		} else if (secondChild) {
			combinedNode.children[key] = secondChild;
		}
	}

	return combinedNode;
};
