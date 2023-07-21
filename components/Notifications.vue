<script setup>
import { inject } from 'vue'
const state = inject('state')
</script>
<template>
  <transition-group name="notification" tag="div" class="notifications">
    <div class="notification" :class="notification.type" v-for="notification in state.notifications"
      :key="notification.id">
      {{ notification.content }}
    </div>
  </transition-group>
</template>
<style>
.notification-enter-active,
.notification-leave-active {
  transition: all 1s;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.notifications {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.notification {
  width: 100%;
  text-align: center;
  padding: 0.5rem;
  font-size: x-large;
  font-weight: bolder;
  font-style: italic;
  color: white;
  background-color: #77777777;
  backdrop-filter: blur(20px);
}

.notification.info {
  background-color: dodgerblue;
}

.notification.give {
  background-color: rgb(255, 123, 0);
}
</style>