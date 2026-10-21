<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { EMAIL_PATTERN, useMarketplace } from '../composables/useMarketplace'
import { CAMPUSES, DEPARTMENTS, STORE_TYPES, initialsOf } from '../data/demoData'

const props = defineProps<{ mode: 'profile' | 'store' }>()
const store = useMarketplace()
const { currentAccount, myProducts } = store

const isStore = computed(() => props.mode === 'store')

const fromAccount = () => {
  const a = currentAccount.value
  return {
    name: isStore.value ? a?.storeName ?? '' : a?.name ?? '',
    email: a?.email ?? '',
    campus: a?.campus ?? CAMPUSES[0],
    department: a?.department ?? DEPARTMENTS[0],
    storeType: a?.storeType ?? STORE_TYPES[0],
    payments: a?.storePayments ?? 'Cash on pickup, GCash',
    notifications: a?.notificationsOn ?? true,
  }
}

const form = reactive(fromAccount())
watch([() => props.mode, () => currentAccount.value?.id], () => Object.assign(form, fromAccount()))

const errors = reactive({ name: '', email: '', payments: '' })

const sellerLabel = computed(() => {
  switch (currentAccount.value?.sellerStatus) {
    case 'approved': return 'Approved seller'
    case 'pending': return 'Seller application pending'
    case 'rejected': return 'Seller application not approved'
    default: return 'Buyer'
  }
})

function save() {
  errors.name = form.name.trim() ? '' : 'This field is required.'
  errors.email = EMAIL_PATTERN.test(form.email.trim()) ? '' : 'Enter a valid email address.'
  errors.payments = isStore.value && !form.payments.trim() ? 'Add at least one payment method.' : ''
  if (errors.name || errors.email || errors.payments) return
  const changes = isStore.value
    ? { storeName: form.name.trim(), storeType: form.storeType, storePayments: form.payments.trim(), campus: form.campus, email: form.email, notificationsOn: form.notifications }
    : { name: form.name.trim(), department: form.department, campus: form.campus, email: form.email, notificationsOn: form.notifications }
  const error = store.updateAccount(changes)
  if (error) {
    errors.email = error
    return
  }
  store.showToast(isStore.value ? 'Store details saved in this browser (demo).' : 'Profile saved in this browser (demo).')
}
</script>

<template>
  <div v-if="currentAccount">
    <header class="page-head">
      <span class="eyebrow">{{ isStore ? 'My store' : 'Your account' }}</span>
      <h1>{{ isStore ? 'Your campus store' : 'Profile & settings' }}</h1>
    </header>

    <div class="profile-grid">
      <aside class="panel profile-card">
        <span class="avatar" aria-hidden="true">
          <AppIcon v-if="isStore" name="store" :size="28" />
          <template v-else>{{ initialsOf(currentAccount.name) }}</template>
        </span>
        <h2>{{ isStore ? currentAccount.storeName : currentAccount.name }}</h2>
        <p>{{ currentAccount.email }}</p>
        <span class="badge"><AppIcon name="shield" :size="11" />{{ isStore ? 'Approved vendor' : 'Verified student · Demo' }}</span>
        <div class="profile-facts">
          <div v-if="currentAccount.studentNumber"><AppIcon name="tag" :size="15" />{{ currentAccount.studentNumber }}</div>
          <div><AppIcon name="book" :size="15" />{{ currentAccount.department }}</div>
          <div><AppIcon name="map-pin" :size="15" />{{ currentAccount.campus }}</div>
          <div v-if="isStore"><AppIcon name="box" :size="15" />{{ myProducts.length }} listing{{ myProducts.length === 1 ? '' : 's' }}</div>
          <div v-else><AppIcon name="store" :size="15" />{{ sellerLabel }}</div>
        </div>
        <button
          v-if="!isStore && currentAccount.sellerStatus !== 'approved'"
          type="button"
          class="btn btn-secondary btn-block"
          style="margin-top: 16px"
          @click="store.navigate('sell')"
        >
          {{ currentAccount.sellerStatus === 'pending' ? 'View application' : 'Become a seller' }}
        </button>
      </aside>

      <form class="panel panel-pad" novalidate @submit.prevent="save">
        <div class="form-grid">
          <label class="field span-2">
            <span>{{ isStore ? 'Store name' : 'Full name' }}</span>
            <input v-model="form.name" class="input" type="text" required :aria-invalid="!!errors.name" />
            <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
          </label>
          <label class="field">
            <span>Email (school or personal)</span>
            <input v-model="form.email" class="input" type="email" required :aria-invalid="!!errors.email" />
            <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
          </label>
          <label class="field">
            <span>Student number</span>
            <input class="input" type="text" :value="currentAccount.studentNumber || 'Not provided'" readonly />
          </label>
          <label class="field">
            <span>Campus</span>
            <select v-model="form.campus" class="select">
              <option v-for="c in CAMPUSES" :key="c">{{ c }}</option>
            </select>
          </label>
          <label v-if="!isStore" class="field">
            <span>Department</span>
            <select v-model="form.department" class="select">
              <option v-for="d in DEPARTMENTS" :key="d">{{ d }}</option>
            </select>
          </label>
          <label v-else class="field">
            <span>Store type</span>
            <select v-model="form.storeType" class="select">
              <option v-for="t in STORE_TYPES" :key="t">{{ t }}</option>
            </select>
          </label>
          <label v-if="isStore" class="field span-2">
            <span>Accepted payment methods</span>
            <input v-model="form.payments" class="input" type="text" :aria-invalid="!!errors.payments" />
            <span v-if="errors.payments" class="field-error">{{ errors.payments }}</span>
          </label>
          <label class="check-row span-2">
            <input v-model="form.notifications" type="checkbox" />
            Email and pickup notifications (simulated)
          </label>
        </div>

        <p class="notice" style="margin-top: 18px">
          <AppIcon name="info" :size="15" />Prototype profile only. Changes are saved in this browser; authentication, verification, and preferences are simulated.
        </p>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="store.logout()">
            <AppIcon name="logout" :size="15" /> Sign out
          </button>
          <button type="submit" class="btn btn-primary">Save changes</button>
        </div>
      </form>
    </div>
  </div>
</template>
