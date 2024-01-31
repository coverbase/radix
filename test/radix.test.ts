import { describe, expect, test } from "bun:test";
import { Radix, combineRadix } from "../src";

describe("Radix Tree", () => {
    describe("insert", () => {
        test("should insert values correctly", () => {
            const radix = new Radix<number>();

            radix.insert("user/:id", 1);
            radix.insert("user/:id/profile", 2);
            radix.insert("user/:id/settings", 3);

            expect(radix.children).toHaveProperty("user");
            expect(radix.children.user.children).toHaveProperty(":");
            expect(radix.children.user.children[":"].children).toHaveProperty("profile");
            expect(radix.children.user.children[":"].children).toHaveProperty("settings");
            expect(radix.children.user.children[":"].children.profile.value).toBe(2);
            expect(radix.children.user.children[":"].children.settings.value).toBe(3);
        });
    });

    describe("match", () => {
        test("should match values correctly with parameters", () => {
            const radix = new Radix<number>();

            radix.insert("user/:id", 1);
            radix.insert("user/:id/profile", 2);
            radix.insert("user/:id/settings", 3);

            const result = radix.match("user/123/profile");

            expect(result?.value).toBe(2);
            expect(result?.parameters).toHaveProperty("id", "123");
        });

        test("should return undefined for non-existent keys", () => {
            const radix = new Radix<number>();

            radix.insert("user/:id", 1);
            radix.insert("user/:id/profile", 2);

            const result = radix.match("user/456/settings");

            expect(result?.value).toBeUndefined();
            expect(result?.parameters).toBeUndefined();
        });
    });
});

describe("combineNodes", () => {
    test("should combine nodes correctly", () => {
        const firstNode = new Radix<number>("id");
        firstNode.insert("user/:id", 1);
        firstNode.insert("user/:id/profile", 2);

        const secondNode = new Radix<number>("name");
        secondNode.insert("user/:name", 3);
        secondNode.insert("user/:name/settings", 4);

        const node = combineRadix(firstNode, secondNode);

        expect(node.parameter).toBe("id");
        expect(node.children).toHaveProperty("user");
        expect(node.children.user.children).toHaveProperty(":");
        expect(node.children.user.children[":"].parameter).toBe("id");
        expect(node.children.user.children[":"].children).toHaveProperty("profile");
        expect(node.children.user.children[":"].children.profile.value).toBe(2);
        expect(node.children.user.children[":"].children).toHaveProperty("settings");
        expect(node.children.user.children[":"].children.settings.value).toBe(4);
    });
});
