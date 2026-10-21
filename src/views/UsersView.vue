<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { useMarketplace } from '../composables/useMarketplace'
import { initialsOf } from '../data/demoData'
import type { Account } from '../types'

const store = useMarketplace()
const { accounts } = store
const query = ref('')

const users = computed(() => {
  const q = query.value.trim().toLowerCase()
  return accounts.value.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
})

const roleLabel = (u: Account) =>
  u.sellerStatus === 'approved' ? 'Seller' : u.sellerStatus === 'pending' ? 'Buyer · applied' : 'Buyer'

const shortDept = (d: string) => d.replace(/^College of /, '')
</script>

<template>
  <div>
    <header class="page-head">
      <span class="eyebrow">Community</span>
      <h1>Campus users</h1>
      <p>Verified students and the people behind the campus community.</p>
    </header>

    <label class="search-inline">
      <span class="sr-only">Search students</span>
      <AppIcon name="search" :size="16" />
      <input v-model="query" class="input" type="search" placeholder="Search students by name or email..." />
    </label>

    <div class="panel table-panel">
      <table class="data-table">
        <thead>
          <tr>
            <th scope="col">Student</th>
            <th scope="col">Student number</th>
            <th scope="col">Department · Campus</th>
            <th scope="col">Role</th>
            <th scope="col" class="th-right">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>
              <div class="user-row">
                <span class="avatar">{{ initialsOf(u.name) }}</span>
                <div>
                  <strong>{{ u.name }}</strong>
                  <small>{{ u.email }}</small>
                </div>
              </div>
            </td>
            <td data-label="Student number">{{ u.studentNumber || '—' }}</td>
            <td data-label="Department · Campus">{{ shortDept(u.department) }} · {{ u.campus }}</td>
            <td data-label="Role"><span class="badge" :class="u.sellerStatus === 'approved' ? 'badge-yellow' : 'badge-gray'">{{ roleLabel(u) }}</span></td>
            <td>
              <div class="table-actions">
                <span class="verified"><AppIcon name="check-circle" :size="14" />Verified</span>
                <span class="muted" aria-hidden="true">·</span>
                <button type="button" class="link-btn" @click="store.showToast(`${u.name} · ${u.email} · ${roleLabel(u)}. Full profiles aren’t part of this prototype.`)">
                  View details
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!users.length" class="mini-empty">No students match “{{ query }}”.</p>
    </div>
  </div>
</template>
