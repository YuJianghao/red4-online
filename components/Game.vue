<script setup>
import { reactive, provide } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { request } from '../api'
const state = reactive({ game: { players: { you: [], other: [] }, ground: [[]], hearts: [] } })
const selected = ref([])
const update = (body) => {
  return request(body).then(data => state.game = data)
}
useIntervalFn(update, 1000)
const nextRound = () => update({ nextRound: true }).then(() => selected.value = [])
const switchPlayer = () => update({ switch: true }).then(() => selected.value = [])
const play = () => update({ play: selected.value }).then(() => selected.value = [])
const undo = () => update({ undo: true })
const refresh = () => update({ refresh: true }).then(() => selected.value = [])
provide('state', state)
provide('update', update)
provide('selected', selected)
const disabled = computed(() => ({
  undo: state.game.ground.length < 1 || state.game.you === state.game.nextPlayer,
  nextRound: state.game.players.you.length !== 0 && state.game.players.other.length !== 0,
  play: selected.value.length === 0 || (state.game.you !== state.game.nextPlayer),
}))
</script>
<template>
  <div class="game">
    <Deck :cards="state.game.players.other" />
    <Deck :cards="state.game.ground[state.game.ground.length - 1] ?? []" visible />
    <Deck :cards="state.game.players.you" visible selectable />
    <div class="buttons">
      <div class="button-line">
        <button @click="refresh">重置游戏</button>
        <button disabled>当前玩家：{{ state.game.you }}</button>
        <button @click="switchPlayer">切换玩家</button>
      </div>
      <div class="button-line">
        <button @click="nextRound" :disabled="disabled.nextRound">下一轮</button>
        <button @click="undo" :disabled="disabled.undo">悔棋</button>
        <button @click="play" :disabled="disabled.play">出牌</button>
      </div>
    </div>
  </div>
</template>
<style>
.game {
  padding: 0 4px;
}

.buttons {
  position: fixed;
  bottom: 0;
  width: 100%;
}

.button-line {
  display: flex;
  justify-content: space-around;
  padding: 10px;
  gap: 10px;
}

.button-line+.button-line {
  padding-top: 0;
}

.buttons button {
  flex: 1;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  cursor: pointer;
  line-height: 2;
  border-radius: 2px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}
</style>