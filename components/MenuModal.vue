<template>
  <div class="modal" v-show="modelValue" @click="closeModal">
    <div class="modal-content" @click.stop="">
      <button class="secondary" v-for="(item, index) in menuItems" :key="index"
        @click="() => item.action?.() && closeModal()" :disabled="item.disabled ?? false">
        {{ item.label }}</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    menuItems: {
      type: Array,
      required: true
    }
  },
  methods: {
    handleClick(action) {
      this.$emit('menu-item-click', action);
      this.closeModal();
    },
    closeModal() {
      this.$emit('update:modelValue', false);
    }
  }
};
</script>

<style>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
}

.modal-content button {
  display: block;
  width: 100vw;
  max-width: 150px;
}

.modal-content button+button {
  margin-top: 16px;
}
</style>
