<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { EMAIL_PATTERN, useMarketplace } from '../composables/useMarketplace'
import { ADMIN_DEMO, CAMPUSES, DEMO_BUYER_PASSWORD, DEPARTMENTS } from '../data/demoData'

/** Sign-in, registration and demo admin access, each at its own URL (/login, /register, /admin/login). */
const props = defineProps<{ mode: 'login' | 'register' | 'admin' }>()
const store = useMarketplace()
const { pendingIntent } = store
const route = useRoute()
const router = useRouter()

const loginOpen = computed(() => props.mode === 'login')
const registerOpen = computed(() => props.mode === 'register')
const adminOpen = computed(() => props.mode === 'admin')
const redirect = computed(() => route.query.redirect)
const root = ref<HTMLElement | null>(null)

/** Switching between sign-in and sign-up replaces the entry, keeping the destination. */
function switchTo(name: 'login' | 'register') {
  router.replace({ name, query: route.query })
}

/** "Keep browsing" returns to wherever the visitor came from, through real browser history when possible. */
function keepBrowsing() {
  if ((window.history.state as { back?: string | null } | null)?.back) router.back()
  else router.push('/')
}

function focusFirst() {
  nextTick(() => root.value?.querySelector<HTMLInputElement>('input')?.focus())
}
onMounted(focusFirst)

const blank = () => ({ name: '', studentNumber: '', department: DEPARTMENTS[0] as string, campus: CAMPUSES[0] as string, email: '', password: '' })
const login = reactive({ email: '', password: '' })
const reg = reactive(blank())
const admin = reactive({ email: ADMIN_DEMO.email, password: ADMIN_DEMO.password })
const errors = ref<Record<string, string>>({})
const formError = ref('')

watch(
  () => props.mode,
  () => {
    focusFirst()
    errors.value = {}
    formError.value = ''
    login.password = ''
    reg.password = ''
  },
)

const intentHint = computed(() => {
  const i = pendingIntent.value
  if (!i) return redirect.value ? 'Sign in to continue. We’ll take you right back.' : ''
  switch (i.type) {
    case 'add-to-cart': return 'Sign in to add this find to your cart. We’ll add it right after.'
    case 'buy-now': return 'Sign in to check out. We’ll take you straight to checkout.'
    case 'save': return 'Sign in to save finds. We’ll save this one for you.'
    case 'report': return 'Sign in to report a listing.'
    default: return ''
  }
})

function useDemoAccount() {
  login.email = 'jamie.delacruz@university.edu.ph'
  login.password = DEMO_BUYER_PASSWORD
}

function submitLogin() {
  const e: Record<string, string> = {}
  if (!EMAIL_PATTERN.test(login.email.trim())) e.email = 'Enter a valid email address.'
  if (login.password.length < 6) e.password = 'Password must be at least 6 characters.'
  errors.value = e
  formError.value = ''
  if (Object.keys(e).length) return
  formError.value = store.login(login.email, login.password, redirect.value) ?? ''
}

function submitRegister() {
  const e: Record<string, string> = {}
  if (!reg.name.trim()) e.name = 'Full name is required.'
  if (!reg.studentNumber.trim()) e.studentNumber = 'Student number is required.'
  if (!EMAIL_PATTERN.test(reg.email.trim())) e.email = 'Enter a valid email address.'
  if (reg.password.length < 6) e.password = 'Password must be at least 6 characters.'
  errors.value = e
  formError.value = ''
  if (Object.keys(e).length) return
  formError.value = store.register({ ...reg }, redirect.value) ?? ''
  if (!formError.value) Object.assign(reg, blank())
}

function submitAdmin() {
  formError.value = store.adminLogin(admin.email, admin.password, redirect.value) ?? ''
}

function forgot() {
  store.showToast('Demo only: password reset emails aren’t sent in this prototype.')
}
</script>

<template>
  <div ref="root" class="auth-page">
  <section v-if="loginOpen" class="auth-card panel" aria-labelledby="auth-title">
    <div>
      <span class="eyebrow">Welcome to the community</span>
      <h1 id="auth-title">Welcome back.</h1>
      <p class="modal-desc">{{ intentHint || 'Sign in with a demo account. This is a simulated login.' }}</p>
    </div>
    <form class="form-stack" novalidate @submit.prevent="submitLogin">
      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
      <label class="field">
        <span>Email (school or personal)</span>
        <input v-model="login.email" class="input" type="email" placeholder="you@university.edu.ph" required autocomplete="email" :aria-invalid="!!errors.email" />
        <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
      </label>
      <label class="field">
        <span>Password</span>
        <input v-model="login.password" class="input" type="password" minlength="6" required autocomplete="current-password" :aria-invalid="!!errors.password" />
        <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
      </label>
      <button type="button" class="link-btn" style="align-self: flex-end" @click="forgot">Forgot password?</button>
      <button type="submit" class="btn btn-primary btn-block">Sign in to demo</button>
      <div class="demo-hint">
        <span>Demo buyer &amp; seller: <code>jamie.delacruz@university.edu.ph</code> / <code>{{ DEMO_BUYER_PASSWORD }}</code></span>
        <button type="button" class="link-btn" @click="useDemoAccount">Use it</button>
      </div>
      <p class="notice"><AppIcon name="info" :size="15" />No real authentication, verification, or emails. Please use mock details.</p>
    </form>
    <p class="modal-switch">
      New around here? <button type="button" class="link-btn" @click="switchTo('register')">Create an account</button>
    </p>
  </section>

  <section v-else-if="registerOpen" class="auth-card panel wide" aria-labelledby="auth-title">
    <div>
      <span class="eyebrow">Join the community</span>
      <h1 id="auth-title">Your campus. Your people.</h1>
      <p class="modal-desc">{{ intentHint ? intentHint.replace('Sign in', 'Create an account') : 'New accounts start as buyers. You can apply to sell any time.' }}</p>
    </div>
    <form novalidate @submit.prevent="submitRegister">
      <p v-if="formError" class="form-error" role="alert" style="margin-bottom: 14px">{{ formError }}</p>
      <div class="form-grid">
        <label class="field span-2">
          <span>Full name</span>
          <input v-model="reg.name" class="input" type="text" required autocomplete="name" :aria-invalid="!!errors.name" />
          <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
        </label>
        <label class="field">
          <span>Student number</span>
          <input v-model="reg.studentNumber" class="input" type="text" placeholder="2024-00000" required :aria-invalid="!!errors.studentNumber" />
          <span v-if="errors.studentNumber" class="field-error">{{ errors.studentNumber }}</span>
        </label>
        <label class="field">
          <span>Department</span>
          <select v-model="reg.department" class="select">
            <option v-for="d in DEPARTMENTS" :key="d">{{ d }}</option>
          </select>
        </label>
        <label class="field">
          <span>Campus</span>
          <select v-model="reg.campus" class="select">
            <option v-for="c in CAMPUSES" :key="c">{{ c }}</option>
          </select>
        </label>
        <label class="field">
          <span>Email (school or personal)</span>
          <input v-model="reg.email" class="input" type="email" placeholder="you@gmail.com" required autocomplete="email" :aria-invalid="!!errors.email" />
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </label>
        <label class="field span-2">
          <span>Password</span>
          <input v-model="reg.password" class="input" type="password" minlength="6" required autocomplete="new-password" :aria-invalid="!!errors.password" />
          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
          <span class="field-hint">At least 6 characters. Demo only: stored in this browser, never sent anywhere.</span>
        </label>
      </div>
      <p class="notice" style="margin-top: 16px"><AppIcon name="info" :size="15" />No real authentication, verification, or emails. Please use mock details. New accounts are buyers; admin access isn’t available through sign-up.</p>
      <button type="submit" class="btn btn-primary btn-block" style="margin-top: 16px">Create demo account</button>
    </form>
    <p class="modal-switch">
      Already part of the community? <button type="button" class="link-btn" @click="switchTo('login')">Sign in</button>
    </p>
  </section>

  <section v-else-if="adminOpen" class="auth-card panel" aria-labelledby="auth-title">
    <div>
      <span class="eyebrow">Separate from public sign-in</span>
      <h1 id="auth-title">Demo admin access</h1>
      <p class="modal-desc">Review seller applications, reports and listings. This entry exists only for the prototype.</p>
    </div>
    <form class="form-stack" novalidate @submit.prevent="submitAdmin">
      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
      <label class="field">
        <span>Admin email</span>
        <input v-model="admin.email" class="input" type="email" autocomplete="off" />
      </label>
      <label class="field">
        <span>Admin password</span>
        <input v-model="admin.password" class="input" type="password" autocomplete="off" />
      </label>
      <p v-if="store.currentAccount.value" class="notice notice-green"><AppIcon name="info" :size="15" />You’re signed in as {{ store.currentAccount.value.name }}. Entering the demo admin signs you out of that account.</p>
      <p class="notice"><AppIcon name="shield" :size="15" />Demo-only administrative access. Credentials are prefilled ({{ ADMIN_DEMO.email }} / {{ ADMIN_DEMO.password }}) and nothing is protected for real.</p>
      <button type="submit" class="btn btn-primary btn-block">Enter demo admin</button>
    </form>
  </section>
    <p class="auth-back"><button type="button" class="link-btn" @click="keepBrowsing"><AppIcon name="chevron-left" :size="14" />Keep browsing</button></p>
  </div>
</template>
