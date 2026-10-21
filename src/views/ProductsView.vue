<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '../types'
import AppIcon from '../components/AppIcon.vue'
import { useMarketplace } from '../composables/useMarketplace'
import { money } from '../data/demoData'

const store = useMarketplace()
const { role, storeName } = store
const products = computed(() => (role.value === 'Admin' ? store.products.value : store.myProducts.value))

function toggle(p: Product) {
  if (p.stock > 0) {
    p.stock = 0
    store.showToast(`${p.name} was deactivated (stock set to 0).`)
  } else {
    p.stock = 1
    store.showToast(`${p.name} is published again (stock set to 1).`)
  }
}
</script>

<template>
  <div>
    <header class="page-head page-head-row">
      <div>
        <span class="eyebrow">{{ role === 'Seller' ? storeName : 'Marketplace listings' }}</span>
        <h1>{{ role === 'Seller' ? 'Product management' : 'Marketplace products' }}</h1>
        <p>Manage listings, inventory, and availability.</p>
      </div>
      <button v-if="role === 'Seller'" type="button" class="btn btn-primary" @click="store.openModal('product-editor')">
        <AppIcon name="plus" :size="16" /> Add product
      </button>
    </header>

    <div v-if="!products.length" class="empty-state">
      <div class="empty-icon"><AppIcon name="box" :size="22" /></div>
      <h3>Your store is ready for its first find</h3>
      <p>List something you no longer need. It goes live on the marketplace right away (demo).</p>
      <button type="button" class="btn btn-primary" @click="store.openModal('product-editor')"><AppIcon name="plus" :size="16" /> Add product</button>
    </div>

    <div v-else class="panel table-panel">
      <table class="data-table">
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Price</th>
            <th scope="col">Stock / status</th>
            <th scope="col" class="th-right">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td>
              <div class="table-product">
                <img :src="p.image" :alt="p.name" />
                <div>
                  <strong>{{ p.name }}</strong>
                  <small>{{ p.category }} · {{ p.condition }}</small>
                </div>
              </div>
            </td>
            <td data-label="Price"><span class="table-price">{{ money(p.price) }}</span></td>
            <td data-label="Stock / status">
              <div class="table-stock">
                {{ p.stock }} in stock
                <span v-if="p.stock > 0" class="badge">Published</span>
                <span v-else class="badge badge-gray">Inactive</span>
              </div>
            </td>
            <td>
              <div class="table-actions">
                <button type="button" class="btn btn-secondary btn-sm" @click="store.openModal('product-editor', { product: p })">
                  <AppIcon name="edit" :size="13" /> Edit
                </button>
                <button type="button" class="btn btn-sm" :class="p.stock > 0 ? 'btn-danger' : 'btn-primary'" @click="toggle(p)">
                  {{ p.stock > 0 ? 'Deactivate' : 'Publish' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
