import { findLast, shuffle } from "lodash-es"
import { ActionMap, Game } from "./base"

const HEART_FOUR = 16
const HEART_KING = 25

export class Red4Game extends Game {
  protected minimumPlayers = 2
  protected maximumPlayers = 2
  get _nextPlayer() {
    const lastAction = this._history[this._history.length - 1]
    if (lastAction.type === "take") {
      const result = Array.from(this._players.entries()).map(([id, player]) => {
        const cards = player.cards
        return [
          id,
          Math.min(
            ...cards.filter((card) => card >= HEART_FOUR && card <= HEART_KING)
          ),
        ] as const
      })
      const min = Math.min(...result.map(([, card]) => card))
      return result.find(([, card]) => card === min)![0]
    }
    const lastPlayAction = findLast(this._history, {
      type: "play",
    }) as ActionMap["PlayAction"] | undefined
    if (lastPlayAction) return this._getOtherPlayer(lastPlayAction.player).id
    return ""
  }
  private _getOtherPlayer(playerId: string) {
    return Array.from(this._players.entries()).find(
      ([id]) => id !== playerId
    )![1]
  }
  private _dealOut() {
    Array.from(this._players.entries()).forEach(([id, player]) => {
      this._dispatch({
        type: "take",
        player: id,
        cards: this._deck.splice(0, 13),
      })
    })
  }
  protected _autoRun() {
    const lastAction = this._history[this._history.length - 1]
    switch (lastAction.type) {
      case "start":
        this._dealOut()
        break
      case "continue":
        const hasPlayerNoCard = Array.from(this._players.entries()).some(
          ([, player]) => player.cards.length === 0
        )
        if (!hasPlayerNoCard) throw new Error("非法操作")
        if (this._deck.length === 0) {
          this.start(lastAction.player)
          return
        }
        Array.from(this._players.entries()).forEach(([id, player]) => {
          if (player.cards.length === 0) return
          this._dispatch({
            type: "drop",
            player: id,
            cards: player.cards,
          })
        })
        this._dealOut()
        break
      default:
        break
    }
  }
  protected _generateDeck() {
    return shuffle(Array.from({ length: 52 }, (_, i) => i + 1))
  }
  override sortCard(cards: number[]): number[] {
    return cards.sort((a, b) => {
      const a1 = a % 13
      const b1 = b % 13
      if (a1 === b1) {
        return a > b ? 1 : -1
      }
      return a1 > b1 ? 1 : -1
    })
  }
  override getState(playerId: string) {
    const original = super.getState(playerId)
    const otherPlayer = this._getOtherPlayer(playerId)
    return {
      ...original,
      game: {
        ...original.game,
        other: otherPlayer.id,
      },
    }
  }
}
