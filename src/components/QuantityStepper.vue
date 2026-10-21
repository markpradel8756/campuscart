<script setup lang="ts">
import AppIcon from './AppIcon.vue'

const props = withDefaults(defineProps<{ modelValue: number; min?: number; max: number; small?: boolean; label?: string }>(), {
  min: 1,
  small: false,
  label: 'Quantity',
})
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const set = (v: number) => emit('update:modelValue', Math.max(props.min, Math.min(props.max, v)))
</script>

<template>
  <div class="stepper" :class="{ sm: small }" role="group" :aria-label="label">
    <button type="button" :disabled="modelValue <= min" aria-label="Decrease quantity" @click="set(modelValue - 1)">
      <AppIcon name="minus" :size="14" />
    </button>
    <output aria-live="polite">{{ modelValue }}</output>
    <button type="button" :disabled="modelValue >= max" aria-label="Increase quantity" @click="set(modelValue + 1)">
      <AppIcon name="plus" :size="14" />
    </button>
  </div>
</template>
