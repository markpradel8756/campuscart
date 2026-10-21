<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import BaseModal from '../BaseModal.vue'
import AppIcon from '../AppIcon.vue'
import { useMarketplace } from '../../composables/useMarketplace'
import { CATEGORIES, CONDITIONS } from '../../data/demoData'

const store = useMarketplace()
const { modal } = store
const open = computed(() => modal.name === 'product-editor')
const editing = computed(() => modal.product)

const categories = CATEGORIES.filter((c) => c.name !== 'All items').map((c) => c.name)
const form = reactive({ name: '', price: 1 as number | string, stock: 1 as number | string, category: categories[0] as string, condition: 'Like new' })
const errors = ref<Record<string, string>>({})

watch(open, (o) => {
  if (!o) return
  errors.value = {}
  const p = modal.product
  Object.assign(form, p
    ? { name: p.name, price: p.price, stock: p.stock, category: p.category, condition: p.condition }
    : { name: '', price: '', stock: 1, category: categories[0], condition: 'Like new' })
})

function onFiles(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) store.showToast(`${files.length} photo${files.length > 1 ? 's' : ''} selected for preview only. Nothing is uploaded.`)
}

function save() {
  const e: Record<string, string> = {}
  const price = Number(form.price)
  const stock = Number(form.stock)
  if (!form.name.trim()) e.name = 'Product name is required.'
  if (form.price === '' || !Number.isFinite(price) || price < 1) e.price = 'Price must be at least ₱1.'
  if (form.stock === '' || !Number.isInteger(stock) || stock < 0) e.stock = 'Stock must be 0 or more.'
  errors.value = e
  if (Object.keys(e).length) return
  store.saveProduct({ name: form.name.trim(), price, stock, category: form.category, condition: form.condition }, editing.value)
  store.closeModal()
}
</script>

<template>
  <BaseModal :open="open" :title="editing ? 'Edit your find.' : 'List a campus find.'" wide @close="store.closeModal()">
    <template #header="{ titleId }">
      <span class="eyebrow">{{ editing ? 'Update listing' : 'New listing' }}</span>
      <h2 :id="titleId">{{ editing ? 'Edit your find.' : 'List a campus find.' }}</h2>
      <p class="modal-desc">Listings are saved in memory for this demo session only.</p>
    </template>
    <form novalidate @submit.prevent="save">
      <div class="form-grid">
        <label class="field span-2">
          <span>Product name</span>
          <input v-model="form.name" class="input" type="text" required />
          <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
        </label>
        <label class="field">
          <span>Price (₱)</span>
          <input v-model="form.price" class="input" type="number" min="1" required inputmode="numeric" />
          <span v-if="errors.price" class="field-error">{{ errors.price }}</span>
        </label>
        <label class="field">
          <span>Stock</span>
          <input v-model="form.stock" class="input" type="number" min="0" required inputmode="numeric" />
          <span v-if="errors.stock" class="field-error">{{ errors.stock }}</span>
        </label>
        <label class="field">
          <span>Category</span>
          <select v-model="form.category" class="select">
            <option v-for="c in categories" :key="c">{{ c }}</option>
          </select>
        </label>
        <label class="field">
          <span>Condition</span>
          <select v-model="form.condition" class="select">
            <option v-for="c in CONDITIONS" :key="c">{{ c }}</option>
          </select>
        </label>
        <div class="field span-2">
          <span class="field-label">Product photos (preview only)</span>
          <label class="file-drop">
            <AppIcon name="image" :size="20" />
            <span>Choose photos<br /><small class="muted">A sample product image is used in this prototype.</small></span>
            <input type="file" accept="image/*" multiple aria-label="Product photos (preview only)" @change="onFiles" />
          </label>
        </div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" @click="store.closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Save &amp; publish</button>
      </div>
    </form>
  </BaseModal>
</template>
