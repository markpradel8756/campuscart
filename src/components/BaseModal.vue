<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'

const props = withDefaults(defineProps<{ open: boolean; title: string; wide?: boolean; center?: boolean }>(), {
  wide: false,
  center: false,
})
const emit = defineEmits<{ close: [] }>()

const panel = ref<HTMLElement | null>(null)
const titleId = `modal-title-${Math.random().toString(36).slice(2, 8)}`
let lastFocused: HTMLElement | null | undefined

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'Tab' && panel.value) {
    const focusable = panel.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select, textarea, [href], [tabindex]:not([tabindex="-1"])',
    )
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      lastFocused = document.activeElement as HTMLElement | null
      document.addEventListener('keydown', onKey)
      await nextTick()
      const target = panel.value?.querySelector<HTMLElement>('input, select, textarea, .btn-primary') ?? panel.value
      target?.focus()
    } else if (lastFocused !== undefined) {
      document.removeEventListener('keydown', onKey)
      if (lastFocused && document.contains(lastFocused)) lastFocused.focus()
      lastFocused = undefined
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
        <div
          ref="panel"
          class="modal"
          :class="{ wide, 'modal-center': center }"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
        >
          <button type="button" class="modal-close" aria-label="Close dialog" @click="emit('close')">
            <AppIcon name="x" :size="18" />
          </button>
          <slot name="header" :title-id="titleId">
            <h2 :id="titleId">{{ title }}</h2>
          </slot>
          <slot :title-id="titleId" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
