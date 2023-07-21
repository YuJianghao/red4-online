<script setup>
import { reactive, provide } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { request } from '../api'
const state = reactive({
  game: { players: { you: [], other: [] }, ground: [[]], hearts: { a: -1, b: -1 } },
  notifications: []
})
const selected = ref([])
const timestamp = ref(0)
const notificationsToAdd = ref([])

useIntervalFn(() => {
  if (notificationsToAdd.value.length === 0) return
  const notification = notificationsToAdd.value[0]
  state.notifications.push(notification)
  setTimeout(() => {
    state.notifications = state.notifications.filter(n => n.id !== notification.id)
  }, notification.duration);
  notificationsToAdd.value = notificationsToAdd.value.slice(1)
}, 300)
const update = (body) => {
  return request(body).then(({ game, time, notifications }) => {
    if (time <= timestamp.value) return
    state.game = game
    notificationsToAdd.value = [...notificationsToAdd.value, ...notifications]
  })
}
useIntervalFn(update, 1000)
const refresh = () => update({ refresh: true }).then(() => selected.value = []).then(nextRound)
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
  undo: state.game.ground.length < 1,
  nextRound: state.game.players.you.length !== 0 && state.game.players.other.length !== 0,
  play: selected.value.length === 0 || !isMyTurn.value,
  pass: !isMyTurn.value,
}))
const otherVisible = computed(() => state.game.players.other.length === 0 || state.game.players.you.length === 0)
const showModal = ref(false)
const showMenu = () => showModal.value = true
const menuItems = computed(() => [
  { label: `当前玩家 ${state.game.you}` },
  { label: '切换玩家', action: switchPlayer },
  { label: '重置游戏', action: refresh },
])
</script>
<template>
  <div class="game">
    <Deck :cards="state.game.players.other" :visible="otherVisible" />
    <Deck :cards="state.game.ground[state.game.ground.length - 1] ?? []" visible />
    <div class="actions" :class="{ visible: isMyTurn }">
      <button @click="pass" :disabled="disabled.pass">不出</button>
      <button @click="play" :disabled="disabled.play">出牌</button>
    </div>
    <Deck :cards="state.game.players.you" visible selectable />
    <div class="actions visible">
      <button class="secondary" @click="showMenu">菜单</button>
      <button class="secondary" @click="nextRound" :disabled="disabled.nextRound">{{ state.game.round
        === 1 ? "下一轮" : "下一把" }}</button>
      <button class="secondary" @click="undo" :disabled="disabled.undo">悔棋</button>
      <button class="secondary" @click="giveCards">进贡</button>
    </div>
  </div>
  <Notifications />
  <MenuModal v-model="showModal" :menuItems="menuItems" />
</template>
<style>
.game {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 16px 0;
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
}

.actions.visible {
  opacity: 1;
}


.actions button {
  border-radius: 0;
}

.actions button:first-child {
  border-radius: 100px 0 0 100px;
}

.actions button:last-child {
  border-radius: 0 100px 100px 0;
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

button:disabled {
  background-color: #f8d39d;
}

button.secondary {
  background-color: dodgerblue;
  box-shadow: none;
}

button.secondary:disabled {
  background-color: #a1c7fb;
}
</style>