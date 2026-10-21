<script setup lang="ts">
import { nextTick, ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { useMarketplace } from '../composables/useMarketplace'

const store = useMarketplace()
const { messages } = store

const draft = ref('')
const body = ref<HTMLElement | null>(null)

async function send() {
  const text = draft.value.trim()
  if (!text) return
  store.sendMessage(text)
  draft.value = ''
  await nextTick()
  body.value?.scrollTo({ top: body.value.scrollHeight, behavior: 'smooth' })
}
</script>

<template>
  <div>
    <header class="page-head">
      <span class="eyebrow">Make a campus connection</span>
      <h1>Messages</h1>
    </header>

    <div class="messages-grid">
      <aside class="panel convo-list" aria-label="Conversations">
        <button type="button" class="convo" aria-current="true">
          <span class="avatar">BM</span>
          <span>
            <strong>Bea’s Book Nook</strong>
            <small>About your campus find</small>
            <span class="active-line">Active on Main Campus</span>
          </span>
        </button>
      </aside>

      <section class="panel chat" aria-label="Chat with Bea’s Book Nook">
        <header class="chat-head">
          <span class="avatar">BM</span>
          <div>
            <strong>Bea’s Book Nook <span class="badge"><AppIcon name="shield" :size="11" />Verified seller</span></strong>
            <small>Campus marketplace · Pickup questions</small>
          </div>
        </header>
        <div ref="body" class="chat-body" aria-live="polite">
          <div v-for="m in messages" :key="m.id" class="bubble" :class="{ me: m.fromMe }">
            {{ m.text }}
            <small>{{ m.time }}</small>
          </div>
        </div>
        <form class="chat-form" @submit.prevent="send">
          <label class="sr-only" for="chat-input">Message</label>
          <input id="chat-input" v-model="draft" class="input" type="text" placeholder="Write a message..." autocomplete="off" />
          <button type="submit" class="btn btn-primary" :disabled="!draft.trim()">
            <AppIcon name="send" :size="15" /> Send
          </button>
        </form>
        <p class="chat-note">Demo chat: messages aren’t delivered or saved.</p>
      </section>
    </div>
  </div>
</template>
