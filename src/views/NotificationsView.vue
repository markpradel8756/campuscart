<script setup lang="ts">
import type { DemoNotification } from '../types'
import AppIcon from '../components/AppIcon.vue'
import { useMarketplace } from '../composables/useMarketplace'

const store = useMarketplace()
const { notifications, unreadCount } = store

const icons: Record<string, string> = { marketplace: 'sparkle', orders: 'package', messages: 'message' }

function open(n: DemoNotification) {
  n.read = true
  store.navigate(n.target)
}
</script>

<template>
  <div>
    <header class="page-head page-head-row">
      <div>
        <span class="eyebrow">Stay in the loop</span>
        <h1>Your notifications</h1>
        <p>A little update from your campus community.</p>
      </div>
      <button type="button" class="btn btn-secondary btn-sm" :disabled="!unreadCount" @click="store.markAllRead()">
        <AppIcon name="check" :size="14" /> Mark all as read
      </button>
    </header>

    <div class="notif-list">
      <button v-for="n in notifications" :key="n.id" type="button" class="notif" :class="{ unread: !n.read }" @click="open(n)">
        <span class="notif-icon"><AppIcon :name="icons[n.target] ?? 'bell'" :size="17" /></span>
        <span class="grow">
          <strong>{{ n.text }}</strong>
          <small>Today · Main Campus</small>
        </span>
        <span v-if="!n.read" class="unread-pip" aria-label="Unread" />
        <AppIcon name="chevron-right" :size="16" />
      </button>
    </div>
  </div>
</template>
