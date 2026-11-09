import { describe, expect, it } from "vitest"
import { content } from "./content/config"
describe("content", () => { it("has a warm editable configuration", () => { expect(content.displayName).toBeTruthy(); expect(content.compliments.length).toBeGreaterThan(0) }) })
