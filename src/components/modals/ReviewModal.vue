<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModal from '../BaseModal.vue'
import AppIcon from '../AppIcon.vue'
import { useMarketplace } from '../../composables/useMarketplace'

const store = useMarketplace()
const { modal } = store
const open = computed(() => modal.name === 'review')

const rating = ref(5)
const text = ref('')
const error = ref('')
watch(open, (o) => { if (o) { rating.value = 5; text.value = ''; error.value = '' } })

function submit() {
  if (!text.value.trim()) { error.value = 'Please share a few words about your find.'; return }
  if (modal.order) modal.order.reviewed = true
  store.closeModal()
  store.showToast('Thank you for your review! It helps the whole campus.')
}
</script>

<template>
  <BaseModal :open="open" title="How was your campus find?" @close="store.closeModal()">
    <template #header="{ titleId }">
      <span class="eyebrow">Leave a review</span>
      <h2 :id="titleId">How was your campus find?</h2>
      <p class="modal-desc">Your experience helps other students shop with confidence.</p>
    </template>
    <div v-if="modal.order" class="product-mini">
      <img :src="modal.order.items[0].product.image" :alt="modal.order.items[0].product.name" />
      {{ modal.order.items[0].product.name }} · {{ modal.order.id }}
    </div>
    <form class="form-stack" novalidate @submit.prevent="submit">
      <fieldset class="fieldset">
        <legend>Your rating</legend>
        <div class="star-input">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            :class="{ on: n <= rating }"
            :aria-label="`${n} star${n > 1 ? 's' : ''}`"
            :aria-pressed="n <= rating"
            @click="rating = n"
          >
            <AppIcon name="star" :size="22" />
          </button>
        </div>
      </fieldset>
      <label class="field">
        <span>Your review</span>
        <textarea v-model="text" class="textarea" required placeholder="What did you love about this find?" :aria-invalid="!!error" />
        <span v-if="error" class="field-error">{{ error }}</span>
      </label>
      <button type="submit" class="btn btn-primary btn-block">Submit review</button>
    </form>
  </BaseModal>
</template>
