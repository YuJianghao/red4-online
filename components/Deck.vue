<script setup>
import { inject } from 'vue'
const props = defineProps({
  title: {
    type: String,
  },
  cards: {
    type: Array,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  },
  selectable: {
    type: Boolean,
    default: false
  }
})

const suitMap = ["♠", "♥", "♦", "♣"]

const rankMap = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
]
function getCard(card) {
  const rank = rankMap[card % 13]
  const suit = suitMap[Math.floor(card / 13)]
  return { rank, suit }
}
const state = inject("state")
const selected = inject("selected")
function onSelect(card) {
  if (props.selectable && props.visible) {
    const idx = selected.value.indexOf(card)
    if (idx > -1) {
      selected.value.splice(idx, 1)
    } else {
      selected.value.push(card)
    }
  }
}
function isVisible(card) {
  return props.visible // || state.game.hearts.includes(card)
}
function getCardClass(card) {
  const parsed = getCard(card)
  return {
    selected: selected.value.includes(card),
    red: ["♥", "♦"].includes(parsed.suit) && isVisible(card)
  }
}
</script>
<template>
  <div class="deck">
    <div class="deck-title" v-if="title">
      {{ title }}
    </div>
    <div class="deck-content">
      <div class="card" v-for="card in props.cards" :key="card" @click="onSelect(card)" :class="getCardClass(card)">
        <div class="card-content">
          <div class="inner" :class="{ snowman: !isVisible(card) }">
            <div>
              <template v-if="isVisible(card)">
                {{ getCard(card).rank }}{{ getCard(card).suit }}
              </template>
              <template v-else>
                ☃︎
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.deck {
  margin: 0 auto;
}

.deck+.deck {
  margin-top: 10px;
}

.deck-content {
  display: flex;
  flex-wrap: wrap;
  height: calc((100vh - 200px)/3);
  align-items: center;
  justify-content: center;
}

.card {
  width: 14.28%;
  max-width: 7vh;
  aspect-ratio: 1/1.6;
  padding: 2px;
  box-sizing: border-box;
}

.card-content {
  width: 100%;
  height: 100%;
  border: 1px solid black;
  text-align: center;
  font-size: 20px;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  transition: all .1s ease-in-out;
  background-color: rgb(255, 251, 251);
}

.selected .card-content {
  transform: translateY(-10px) scale(1.1)
}

.red .card-content {
  color: rgb(175, 32, 32);
}

.inner {
  padding: 4px;
  height: 100%;
}

.inner>div {
  height: 100%;
  border-radius: 3px;
}

.inner>div {}

.snowman>div {
  background-color: rgb(224, 235, 255);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>