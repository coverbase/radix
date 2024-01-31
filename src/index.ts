export type Match<T> = {
    value: T;
    parameters: Record<string, string>;
};

export class Radix<T> {
    value?: T;
    parameter?: string;
    children: Record<string, Radix<T>>;

    constructor(parameter?: string) {
        this.parameter = parameter;
        this.children = {};
    }

    insert = (key: string, value: T) => {
        let node: Radix<T> = this;

        for (const segment of key.split("/")) {
            const isParameter = segment.startsWith(":");
            const path = isParameter ? ":" : segment;

            let childNode = node.children[path];

            if (childNode === undefined) {
                childNode = isParameter ? new Radix<T>(segment.substring(1)) : new Radix<T>();

                node.children[path] = childNode;
            }

            node = childNode;
        }

        node.value = value;
    };

    match = (key: string): Match<T> | undefined => {
        let node: Radix<T> = this;
        const parameters: Record<string, string> = {};

        for (const segment of key.split("/")) {
            node = node.children[segment] ?? node.children[":"];

            if (node?.parameter) {
                parameters[node.parameter] = segment;
            }
        }

        if (node?.value) {
            return {
                value: node.value,
                parameters,
            };
        }
    };
}

export const combineRadix = <T>(firstNode: Radix<T>, secondNode: Radix<T>): Radix<T> => {
    const combinedNode = new Radix<T>();

    combinedNode.value = firstNode.value !== undefined ? firstNode.value : secondNode.value;

    combinedNode.parameter =
        firstNode.parameter !== undefined ? firstNode.parameter : secondNode.parameter;

    for (const key of new Set([
        ...Object.keys(firstNode.children),
        ...Object.keys(secondNode.children),
    ])) {
        const firstChild = firstNode.children[key];
        const secondChild = secondNode.children[key];

        if (firstChild && secondChild) {
            combinedNode.children[key] = combineRadix(firstChild, secondChild);
        } else if (firstChild) {
            combinedNode.children[key] = firstChild;
        } else if (secondChild) {
            combinedNode.children[key] = secondChild;
        }
    }

    return combinedNode;
};
