import { cloneDeep } from "lodash-es"

class Player {
  private _cards: number[] = []
  get cards() {
    return this._cards
  }
  constructor(public readonly id: string) {}
  takeCards(cards: number[]) {
    this._cards.push(...cards)
  }
  dropCards(cards: number[]) {
    this._cards = this._cards.filter((card) => !cards.includes(card))
  }
  setCards(cards: number[]) {
    this._cards = cards
  }
}

export type ActionMap = {
  SetDeckAction: { type: "setDeck"; deck: number[] }
  DropAction: { type: "drop"; player: string; cards: number[] }
  JoinAction: { type: "join"; player: string }
  StartAction: { type: "start"; player: string }
  TakeAction: { type: "take"; cards: number[]; player: string }
  PlayAction: { type: "play"; cards: number[]; player: string }
  GiveAction: { type: "give"; cards: number[]; source: string; target: string }
  ContinueAction: { type: "continue"; player: string }
}

export type Action = ActionMap[keyof ActionMap]

export abstract class Game {
  protected abstract minimumPlayers: number
  protected abstract maximumPlayers: number
  protected _deck: number[] = []
  protected _dropDeck: number[] = []
  protected _ground: number[][] = []
  protected _players: Map<string, Player> = new Map()
  protected abstract get _nextPlayer(): string
  protected _history: Action[] = []
  constructor() {}
  protected _dispatch(action: Action) {
    console.log(action, new Date())
    if (action.type === "start") this._history = []
    this._history.push(action)
    switch (action.type) {
      case "start":
        const msg = this._canStart()
        if (msg) this.notify([action.player], msg)
        this._deck = this._generateDeck()
        this._dropDeck = []
        this._players.forEach((player) => player.setCards([]))
        this._ground = []
        break
      case "join":
        this._players.set(action.player, new Player(action.player))
        break
      case "take":
        this._players.get(action.player)?.takeCards(action.cards)
        break
      case "play":
        this._ground.push(action.cards)
        this._players.get(action.player)?.dropCards(action.cards)
        break
      case "give":
        this._players.get(action.target)?.takeCards(action.cards)
        this._players.get(action.source)?.dropCards(action.cards)
        break
      case "drop":
        this._dropDeck.push(...action.cards)
        this._players.get(action.player)?.dropCards(action.cards)
      case "continue":
        break
      default:
        break
    }
    this._autoRun()
  }
  protected abstract _autoRun(): void
  reset(playerId: string) {
    this._dispatch({ type: "start", player: playerId })
  }
  private _canStart() {
    if (this._players.size < this.minimumPlayers) {
      return "玩家数量不足"
    }
    if (this._players.size > this.maximumPlayers) {
      return "玩家数量过多"
    }
    return ""
  }
  start(playerId: string) {
    this._dispatch({ type: "start", player: playerId })
  }
  join(playerId: string) {
    if (this._players.has(playerId)) throw new Error("玩家已存在")
    if (this._players.size >= this.maximumPlayers)
      throw new Error("玩家数量过多")
    this._dispatch({ type: "join", player: playerId })
  }
  private _baseCheckDropCards(playerId: string, cards: number[]) {
    const player = this._players.get(playerId)
    if (!player) throw new Error("非法出牌")
    const playerCards = player.cards
    if (cards.length > playerCards.length) throw new Error("非法出牌")
    const cardSet = new Set(playerCards)
    for (const card of cards) {
      if (!cardSet.has(card)) throw new Error("非法出牌")
    }
  }
  private _baseCheckPlayCards(playerId: string, cards: number[]) {
    if (this._nextPlayer !== playerId) throw new Error("非法出牌")
    this._baseCheckDropCards(playerId, cards)
  }
  protected _checkPlayCards(playerId: string, cards: number[]) {}
  play(playerId: string, cards: number[]) {
    this._baseCheckPlayCards(playerId, cards)
    this._dispatch({ type: "play", cards, player: playerId })
  }
  give(playerId: string, cards: number[], targetId: string) {
    this._baseCheckDropCards(playerId, cards)
    this._dispatch({ type: "give", cards, source: playerId, target: targetId })
  }
  drop(playerId: string, cards: number[]) {
    this._baseCheckPlayCards(playerId, cards)
    this._dispatch({ type: "drop", cards, player: playerId })
  }
  protected abstract _generateDeck(): number[]
  continue(playerId: string) {
    this._dispatch({ type: "continue", player: playerId })
  }
  notify(playerIds: string[], message: string) {
    console.log(playerIds, message)
    throw new Error(message)
  }
  sortCard(cards: number[]) {
    return cards.sort((a, b) => {
      if (a > 51 && b > 51) return a > b ? 1 : -1
      if (a > 51) return 1
      if (b > 51) return -1
      const a1 = a % 13
      const b1 = b % 13
      if (a1 === b1) {
        return a > b ? 1 : -1
      }
      return a1 > b1 ? 1 : -1
    })
  }
  getState(playerId: string) {
    return cloneDeep({
      game: {
        player: Array.from(this._players.entries()).reduce(
          (acc, [id, player]) => {
            acc[id] = player.cards
            return acc
          },
          {} as Record<string, number[]>
        ),
        ground: this._ground,
        you: playerId,
        nextPlayer: this._nextPlayer,
      },
    })
  }
}
