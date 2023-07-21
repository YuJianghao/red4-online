type Player = "a" | "b"

const HEART_FOUR = 16
const HEART_KING = 25

function sortCard(cards: number[]) {
  return cards.sort((a, b) => {
    const a1 = a % 13
    const b1 = b % 13
    if (a1 === b1) {
      return a > b ? 1 : -1
    }
    return a1 > b1 ? 1 : -1
  })
}

interface Notification {
  id: string
  content: string
  duration: number
  type: string
}

class Game {
  deck: number[] = []
  players: { a: number[]; b: number[] } = { a: [], b: [] }
  ground: number[][] = []
  nextPlayer: Player = "a"
  first = false
  hearts = { a: -1, b: -1 }
  notifications: { a: Notification[]; b: Notification[] } = { a: [], b: [] }

  get round() {
    return this.deck.length === 0 ? 2 : 1
  }

  generateDeck() {
    const arr = Array.from({ length: 52 }).map((_, i) => i)
    this.deck = arr.sort(() => Math.random() - 0.5)
  }

  nextRound() {
    if (this.deck.length === 0) {
      this.generateDeck()
    }
    this.players.a = sortCard(this.deck.splice(0, 13))
    this.players.b = sortCard(this.deck.splice(0, 13))
    this.first = true
    this.hearts = { a: -1, b: -1 }
    this.ground = []
    this.updateNextPlayer()
    this.addNotification("a", `Round ${this.round}`, "start", 1000)
    this.addNotification("b", `Round ${this.round}`, "start", 1000)
  }

  updateNextPlayer() {
    // 第一次，找红四
    if (this.first) {
      this.first = false
      const a = Math.min(
        ...this.players.a.filter(
          (card) => HEART_FOUR <= card && card <= HEART_KING
        )
      )
      const b = Math.min(
        ...this.players.b.filter(
          (card) => HEART_FOUR <= card && card <= HEART_KING
        )
      )
      this.hearts = { a, b }
      this.nextPlayer = a < b ? "a" : "b"
      return
    }
    this.nextPlayer = this.nextPlayer === "a" ? "b" : "a"
  }

  pass(player: Player) {
    if (this.nextPlayer !== player) return
    this.play(player, [])
  }

  play(player: Player, cards: number[]) {
    this.ground.push(sortCard(cards))
    this.players[player] = this.players[player].filter(
      (card) => !cards.includes(card)
    )
    this.updateNextPlayer()
  }

  undo(player: Player) {
    const other = player === "a" ? "b" : "a"
    const lastPlayer = this.nextPlayer === "a" ? "b" : "a"
    if (player !== lastPlayer) {
      this.addNotification(player, "已向对方申请悔棋", "info")
      this.addNotification(other, "对方申请悔棋", "info")
      return
    }
    const lastCards = this.ground.pop()
    if (lastCards) {
      this.players[lastPlayer].push(...lastCards)
      this.players[lastPlayer] = sortCard(this.players[lastPlayer])
      this.updateNextPlayer()
    }
  }

  addNotification(
    player: Player,
    content: string,
    type: string,
    duration = 3000
  ) {
    this.notifications[player].push({
      id: Math.random().toString(),
      content,
      duration,
      type,
    })
  }

  giveCards(player: Player, cards: number[]) {
    const other = player === "a" ? "b" : "a"
    this.addNotification(other, `对方给你进贡了 ${cards.length} 张牌`, "give")
    this.players[other] = sortCard(this.players[other].concat(cards))
    this.players[player] = this.players[player].filter(
      (card) => !cards.includes(card)
    )
  }

  getState(player: Player) {
    const other = player === "a" ? "b" : "a"
    return {
      you: player,
      other,
      deck: this.deck,
      players: {
        you: this.players[player],
        other: this.players[other],
      },
      ground: this.ground,
      nextPlayer: this.nextPlayer,
      round: this.round,
      hearts: this.hearts,
    }
  }

  getNotifications(player: Player) {
    const notifications = this.notifications[player]
    this.notifications[player] = []
    return notifications
  }
}

let game = new Game()
function refresh() {
  game = new Game()
}

const ID_COOKIE_KEY = "id"

const idHandler = defineEventHandler(async (event) => {
  const body = event.context.body
  const id = getCookie(event, ID_COOKIE_KEY)
  if (!id || !["a", "b"].includes(id)) {
    setCookie(event, ID_COOKIE_KEY, "a")
    event.context.id = "a"
  } else {
    if (body.refresh) refresh()
    if (body.switch) {
      const nextId = id === "a" ? "b" : "a"
      setCookie(event, ID_COOKIE_KEY, nextId)
      event.context.id = nextId
    } else {
      event.context.id = id
    }
  }
  return event.context.id
})

const stateHandler = defineEventHandler(async (event) => {
  const player = event.context.id as Player
  return {
    game: game.getState(player),
    time: +Date.now(),
    notifications: game.getNotifications(player),
  }
})

const undoHandler = defineEventHandler(async (event) => {
  const player = event.context.id as Player
  game.undo(player)
})

export default defineEventHandler(async (event) => {
  event.context.body = (await readBody(event)) ?? {}
  const body = event.context.body
  const player = await idHandler(event)
  if (body.undo) undoHandler(event)
  else if (body.nextRound) game.nextRound()
  else if (body.play) game.play(player, body.play)
  else if (body.pass) game.pass(player)
  else if (body.giveCards) game.giveCards(player, body.giveCards)
  return stateHandler(event)
})
