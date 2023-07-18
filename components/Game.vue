<script setup>
import { reactive, provide } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { request } from '../api'
const state = reactive({ game: { players: { you: [], other: [] }, ground: [[]], hearts: { a: -1, b: -1 } } })
const selected = ref([])
const timestamp = ref(0)
const update = (body) => {
  return request(body).then(({ game, time }) => {
    if (time <= timestamp.value) return
    state.game = game
  })
}
useIntervalFn(update, 1000)
const refresh = () => update({ refresh: true }).then(() => selected.value = [])
const nextRound = () => update({ nextRound: true }).then(() => selected.value = [])
const switchPlayer = () => update({ switch: true }).then(() => selected.value = [])
const undo = () => update({ undo: true })
const giveCards = () => update({ giveCards: selected.value }).then(() => selected.value = [])
const pass = () => update({ pass: true }).then(() => selected.value = [])
const play = () => update({ play: selected.value }).then(() => selected.value = [])
provide('state', state)
provide('update', update)
provide('selected', selected)
const isMyTurn = computed(() => state.game.you === state.game.nextPlayer)
const disabled = computed(() => ({
  undo: state.game.ground.length < 1 || state.game.you === state.game.nextPlayer,
  nextRound: state.game.players.you.length !== 0 && state.game.players.other.length !== 0,
  play: selected.value.length === 0 || !isMyTurn.value,
  pass: !isMyTurn.value,
}))
const banners = computed(() => [
  `第 ${state.game.round} 轮`,
  `当前玩家 ${state.game.you}`,
  `玩家 ${state.game.nextPlayer} 出牌`,
].join(' | '))
</script>
<template>
  <div class="game">
    <div class="banner">
      {{ banners }}
    </div>
    <Deck :cards="state.game.players.other" />
    <Deck :cards="state.game.ground[state.game.ground.length - 1] ?? []" visible />
    <div class="actions" :class="{ visible: isMyTurn }">
      <button @click="pass" :disabled="disabled.pass">不出</button>
      <button @click="play" :disabled="disabled.play">出牌</button>
    </div>
    <Deck :cards="state.game.players.you" visible selectable />
    <div class="actions visible">
      <button class="secondary" @click="refresh">重置游戏</button>
      <button class="secondary" @click="nextRound" :disabled="disabled.nextRound">下一轮</button>
      <button class="secondary" @click="switchPlayer">切换玩家</button>
      <button class="secondary" @click="undo" :disabled="disabled.undo">悔棋</button>
      <button class="secondary" @click="giveCards">进贡</button>
    </div>
  </div>
</template>
<style>
.game {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.deck {
  flex: 1;
}

.banner {
  font-size: small;
  text-align: center;
  font-weight: lighter;
  padding: 2px 0;
  margin: 10px 0;
}

.banner .link {
  color: cornflowerblue;
}

.actions {
  display: flex;
  justify-content: center;
  opacity: 0;
  margin-bottom: 16px;
  gap: 10px;
}

.actions.visible {
  opacity: 1;
}

button {
  border-radius: 100px;
  box-shadow: 0 1px 1px orange;
  outline: none;
  border: none;
  background-color: orange;
  padding: 4px 16px;
  color: white;
  font-weight: bolder;
}

button.secondary {
  background-color: dodgerblue;
  box-shadow: none;
}

button:disabled {
  opacity: 0.5;
}
</style>