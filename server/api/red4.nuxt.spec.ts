import { describe, expect, test } from "vitest"
import { Red4Game } from "./red4"
import game from "./game"

class TestRed4 extends Red4Game {
  protected override _generateDeck(): number[] {
    return Array.from({ length: 52 }, (_, i) => i)
  }
}

describe("dev test", () => {
  test("should work", () => {
    const game = new TestRed4()
    game.join("a")
    game.join("b")
    game.start("a")
    game.play("b", [13])
    game.play("a", [0, 1, 2, 3, 4, 5, 6])
    game.play("b", [14, 15, 16, 17, 18, 19, 20, 21, 22, 23])
    game.play("a", [])
    game.play("b", [24, 25])
    game.continue("a")
    game.play("a", [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36])
    game.give("a", [37, 38], "b")
    game.play("b", [37, 38])
    game.continue("a")
    expect(game.getState("a")).toMatchInlineSnapshot(`
      {
        "game": {
          "ground": [],
          "nextPlayer": "b",
          "other": "b",
          "player": {
            "a": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
            ],
            "b": [
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
            ],
          },
          "you": "a",
        },
      }
    `)
  })
})
