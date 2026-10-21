<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModal from '../BaseModal.vue'
import { useMarketplace } from '../../composables/useMarketplace'
import { REPORT_REASONS } from '../../data/demoData'

const store = useMarketplace()
const { modal } = store
const open = computed(() => modal.name === 'report')

const reason = ref<string>(REPORT_REASONS[0])
const details = ref('')
const error = ref('')

watch(open, (o) => {
  if (o) { reason.value = REPORT_REASONS[0]; details.value = ''; error.value = '' }
})

function submit() {
  if (!details.value.trim()) { error.value = 'Please add a few details.'; return }
  if (modal.product) store.addReport(modal.product.name, reason.value)
  store.closeModal()
}
</script>

<template>
  <BaseModal :open="open" title="Help keep campus safe." @close="store.closeModal()">
    <template #header="{ titleId }">
      <span class="eyebrow">Report this listing</span>
      <h2 :id="titleId">Help keep campus safe.</h2>
      <p class="modal-desc">Reports go to the campus admin team in this demo.</p>
    </template>
    <div v-if="modal.product" class="product-mini">
      <img :src="modal.product.image" :alt="modal.product.name" />
      {{ modal.product.name }}
    </div>
    <form class="form-stack" novalidate @submit.prevent="submit">
      <label class="field">
        <span>Reason</span>
        <select v-model="reason" class="select">
          <option v-for="r in REPORT_REASONS" :key="r">{{ r }}</option>
        </select>
      </label>
      <label class="field">
        <span>Additional details</span>
        <textarea v-model="details" class="textarea" required placeholder="Tell us what seems off..." :aria-invalid="!!error" />
        <span v-if="error" class="field-error">{{ error }}</span>
      </label>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" @click="store.closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Submit report</button>
      </div>
    </form>
  </BaseModal>
</template>
