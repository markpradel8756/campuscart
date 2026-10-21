<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import StatCard from '../components/StatCard.vue'
import { useMarketplace } from '../composables/useMarketplace'
import { PAYOUT_HISTORY, SEED_STORE, money } from '../data/demoData'

const store = useMarketplace()
const { storeName, storeOrders } = store

// The seed store shows the prototype's static mock payouts; new stores show totals from their demo orders.
const isSeedStore = computed(() => storeName.value === SEED_STORE)
const storeTotal = (status: string) =>
  storeOrders.value
    .filter((o) => o.status === status)
    .flatMap((o) => o.items)
    .filter((i) => i.product.store === storeName.value)
    .reduce((s, i) => s + i.qty * i.product.price, 0)

const earned = computed(() => (isSeedStore.value ? 4250 : storeTotal('Completed')))
const pending = computed(() => (isSeedStore.value ? 850 : storeTotal('Ready for Pickup') + storeTotal('Confirmed')))
</script>

<template>
  <div>
    <header class="page-head">
      <span class="eyebrow">Earnings</span>
      <h1>Your payouts</h1>
      <p>A clear view of what you’ve earned. All amounts shown are mock data.</p>
    </header>

    <div class="stat-grid three">
      <StatCard label="Total earned" :value="money(earned)" icon="wallet" />
      <StatCard label="Pending payout" :value="money(pending)" icon="clock" tone="yellow" />
      <StatCard label="Platform fees" :value="money(0)" icon="tag" />
    </div>

    <section class="panel table-panel" style="margin-top: 18px" aria-labelledby="payout-title">
      <div class="panel-head"><h2 id="payout-title" class="panel-title">Payout history</h2></div>
      <table v-if="isSeedStore" class="data-table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Gross</th>
            <th scope="col">Fees</th>
            <th scope="col">Amount</th>
            <th scope="col" class="th-right">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in PAYOUT_HISTORY" :key="p.date">
            <td><strong>{{ p.date }}</strong></td>
            <td data-label="Gross">{{ money(p.amount) }}</td>
            <td data-label="Fees">{{ money(0) }}</td>
            <td data-label="Amount"><span class="payout-row-amount">{{ money(p.amount) }}</span></td>
            <td><div class="table-actions"><span class="badge">Paid · Demo</span></div></td>
          </tr>
        </tbody>
      </table>
      <p v-else class="mini-empty"><AppIcon name="wallet" :size="18" style="margin: 0 auto 6px" />No payouts yet. Completed orders appear here as mock payouts.</p>
    </section>
  </div>
</template>
