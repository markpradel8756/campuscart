<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { useMarketplace } from '../composables/useMarketplace'
import { CATEGORIES, PICKUP_LOCATIONS, STORE_TYPES } from '../data/demoData'

const store = useMarketplace()
const { currentAccount, isGuest, isAdmin, myApplication } = store

const status = computed(() => currentAccount.value?.sellerStatus ?? 'none')
const reapplying = ref(false)
const showForm = computed(() => status.value === 'none' || (status.value === 'rejected' && reapplying.value))

const categories = CATEGORIES.filter((c) => c.name !== 'All items').map((c) => c.name)
const form = reactive({
  name: '',
  type: STORE_TYPES[0] as string,
  category: categories[0],
  location: PICKUP_LOCATIONS[0] as string,
  permit: '',
  description: '',
  agree: false,
})
const errors = ref<Record<string, string>>({})

function startReapply() {
  form.name = myApplication.value?.name ?? ''
  reapplying.value = true
}

function submit() {
  const e: Record<string, string> = {}
  if (form.name.trim().length < 3) e.name = 'Give your store a name (at least 3 characters).'
  if (form.description.trim().length < 10) e.description = 'Tell us a little about what you’ll sell (at least 10 characters).'
  if (form.type === 'Campus vendor' && !form.permit.trim()) e.permit = 'Campus vendors need a business permit number.'
  if (!form.agree) e.agree = 'Please agree to the campus selling guidelines.'
  errors.value = e
  if (Object.keys(e).length) return
  store.submitApplication(form)
  reapplying.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const steps = computed(() => [
  { title: 'Application submitted', text: 'We have your store details.', state: 'done' },
  {
    title: 'Admin review',
    text: status.value === 'pending' ? 'A campus admin is reviewing it now (simulated).' : status.value === 'rejected' ? 'Not approved this time.' : 'Reviewed.',
    state: status.value === 'pending' ? 'current' : 'done',
  },
  { title: 'Seller tools unlocked', text: 'List finds, manage stock and orders.', state: status.value === 'approved' ? 'done' : '' },
])
</script>

<template>
  <div>
    <header class="page-head">
      <span class="eyebrow">Less clutter. More possibilities.</span>
      <h1>Become a campus seller</h1>
      <p>Someone on campus needs what you don’t. Apply once, and a campus admin reviews your store.</p>
    </header>

    <div class="sell-layout">
      <div>
        <!-- Guest -->
        <section v-if="isGuest" class="panel guest-panel">
          <div class="empty-icon"><AppIcon name="store" :size="22" /></div>
          <h2 class="panel-title">Sign in to apply</h2>
          <p class="muted" style="margin: 6px 0 18px; font-size: 13px">Seller applications are linked to your demo account.</p>
          <RouterLink :to="{ name: 'login', query: { redirect: '/sell' } }" class="btn btn-primary">Sign in</RouterLink>
          <RouterLink :to="{ name: 'register', query: { redirect: '/sell' } }" class="btn btn-secondary">Create an account</RouterLink>
        </section>

        <section v-else-if="isAdmin" class="panel guest-panel">
          <h2 class="panel-title">You’re in the demo admin</h2>
          <p class="muted" style="margin: 6px 0 18px; font-size: 13px">Review applications from the admin workspace instead.</p>
          <button type="button" class="btn btn-primary" @click="store.navigate('vendors')">Open seller applications</button>
        </section>

        <!-- Application form -->
        <form v-else-if="showForm" class="panel panel-pad" novalidate @submit.prevent="submit">
          <h2 class="panel-title">Your store application</h2>
          <p class="muted" style="font-size: 12.5px; margin: 4px 0 18px">Applying as {{ currentAccount?.name }} · {{ currentAccount?.email }}</p>
          <div class="form-grid">
            <label class="field span-2">
              <span>Store name</span>
              <input v-model="form.name" class="input" type="text" placeholder="e.g. Jamie’s Study Finds" required :aria-invalid="!!errors.name" />
              <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
            </label>
            <label class="field">
              <span>Store type</span>
              <select v-model="form.type" class="select">
                <option v-for="t in STORE_TYPES" :key="t">{{ t }}</option>
              </select>
            </label>
            <label class="field">
              <span>Main category</span>
              <select v-model="form.category" class="select">
                <option v-for="c in categories" :key="c">{{ c }}</option>
              </select>
            </label>
            <label class="field">
              <span>Usual pickup spot</span>
              <select v-model="form.location" class="select">
                <option v-for="l in PICKUP_LOCATIONS" :key="l">{{ l }}</option>
              </select>
            </label>
            <label class="field">
              <span>Business permit {{ form.type === 'Campus vendor' ? '' : '(optional)' }}</span>
              <input v-model="form.permit" class="input" type="text" placeholder="BUS-2026-0000" :aria-invalid="!!errors.permit" />
              <span v-if="errors.permit" class="field-error">{{ errors.permit }}</span>
            </label>
            <label class="field span-2">
              <span>What will you sell?</span>
              <textarea v-model="form.description" class="textarea" placeholder="Pre-loved textbooks, notes, and calculators..." :aria-invalid="!!errors.description" />
              <span v-if="errors.description" class="field-error">{{ errors.description }}</span>
            </label>
            <label class="check-row span-2">
              <input v-model="form.agree" type="checkbox" :aria-invalid="!!errors.agree" />
              I’ll meet buyers in public campus spots and list items honestly.
            </label>
            <span v-if="errors.agree" class="field-error span-2">{{ errors.agree }}</span>
          </div>
          <p class="notice" style="margin-top: 18px"><AppIcon name="info" :size="15" />Simulated application. No documents are checked and nothing is sent anywhere.</p>
          <div class="form-actions">
            <button v-if="reapplying" type="button" class="btn btn-secondary" @click="reapplying = false">Cancel</button>
            <span v-else />
            <button type="submit" class="btn btn-primary">Submit application</button>
          </div>
        </form>

        <!-- Status -->
        <section v-else class="panel panel-pad status-card" aria-live="polite">
          <div class="status-hero">
            <span class="success-icon" :class="status">
              <AppIcon :name="status === 'approved' ? 'check-circle' : status === 'pending' ? 'clock' : 'alert'" :size="24" />
            </span>
            <div>
              <span class="badge" :class="status === 'approved' ? '' : status === 'pending' ? 'badge-yellow' : 'badge-red'">
                {{ status === 'approved' ? 'Approved' : status === 'pending' ? 'Pending review' : 'Not approved' }}
              </span>
              <h2 style="margin-top: 8px">
                {{ status === 'approved' ? 'Your store is open!' : status === 'pending' ? 'Your application is in review.' : 'Your application wasn’t approved.' }}
              </h2>
              <p v-if="status === 'approved'">{{ currentAccount?.storeName }} is approved. Your seller tools are unlocked, and you can still shop as usual.</p>
              <p v-else-if="status === 'pending'">{{ myApplication?.name }} is waiting for a campus admin. You can keep shopping while you wait.</p>
              <p v-else>You can update your details and apply again.</p>
            </div>
          </div>
          <ol class="steps">
            <li v-for="(s, i) in steps" :key="s.title" :class="s.state">
              <span class="step-dot"><AppIcon v-if="s.state === 'done'" name="check" :size="13" /><template v-else>{{ i + 1 }}</template></span>
              <span><strong>{{ s.title }}</strong><small>{{ s.text }}</small></span>
            </li>
          </ol>
          <p v-if="status === 'pending'" class="notice"><AppIcon name="info" :size="15" />Demo tip: open “Demo admin” to approve or reject this application, then sign back in here.</p>
          <div class="card-actions">
            <button v-if="status === 'approved'" type="button" class="btn btn-primary" @click="store.setSellerMode(true)">Go to seller dashboard</button>
            <button v-if="status === 'rejected'" type="button" class="btn btn-primary" @click="startReapply">Apply again</button>
            <button type="button" class="btn btn-secondary" @click="store.navigate('marketplace')">Keep shopping</button>
          </div>
        </section>
      </div>

      <aside class="panel panel-pad">
        <h2 class="panel-title">Why sell on campus?</h2>
        <ul class="perk-list">
          <li><AppIcon name="walk" :size="15" />No shipping. Meet buyers a short walk away.</li>
          <li><AppIcon name="tag" :size="15" />₱0 platform fees in this demo.</li>
          <li><AppIcon name="leaf" :size="15" />Give pre-loved finds a new beginning.</li>
          <li><AppIcon name="shield" :size="15" />Every store is reviewed by a campus admin.</li>
        </ul>
      </aside>
    </div>
  </div>
</template>
