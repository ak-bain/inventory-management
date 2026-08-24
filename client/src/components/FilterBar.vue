<template>
  <div class="filters-bar">
    <div class="filters-container">
      <div class="filters-grid">
        <div class="filter-group">
          <label>{{ t('filters.timePeriod') }}</label>
          <select v-model="selectedPeriod" class="filter-select">
            <option value="all">{{ t('filters.allMonths') }}</option>
            <option value="2025-01">{{ t('months.january') }}</option>
            <option value="2025-02">{{ t('months.february') }}</option>
            <option value="2025-03">{{ t('months.march') }}</option>
            <option value="2025-04">{{ t('months.april') }}</option>
            <option value="2025-05">{{ t('months.may') }}</option>
            <option value="2025-06">{{ t('months.june') }}</option>
            <option value="2025-07">{{ t('months.july') }}</option>
            <option value="2025-08">{{ t('months.august') }}</option>
            <option value="2025-09">{{ t('months.september') }}</option>
            <option value="2025-10">{{ t('months.october') }}</option>
            <option value="2025-11">{{ t('months.november') }}</option>
            <option value="2025-12">{{ t('months.december') }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>{{ t('filters.location') }}</label>
          <select v-model="selectedLocation" class="filter-select">
            <option value="all">{{ t('filters.all') }}</option>
            <option value="San Francisco">{{ t('warehouses.sanFrancisco') }}</option>
            <option value="London">{{ t('warehouses.london') }}</option>
            <option value="Tokyo">{{ t('warehouses.tokyo') }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>{{ t('filters.category') }}</label>
          <select v-model="selectedCategory" class="filter-select">
            <option value="all">{{ t('filters.all') }}</option>
            <option value="circuit boards">{{ t('categories.circuitBoards') }}</option>
            <option value="sensors">{{ t('categories.sensors') }}</option>
            <option value="actuators">{{ t('categories.actuators') }}</option>
            <option value="controllers">{{ t('categories.controllers') }}</option>
            <option value="power supplies">{{ t('categories.powerSupplies') }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>{{ t('filters.orderStatus') }}</label>
          <select v-model="selectedStatus" class="filter-select">
            <option value="all">{{ t('filters.all') }}</option>
            <option value="delivered">{{ t('status.delivered') }}</option>
            <option value="shipped">{{ t('status.shipped') }}</option>
            <option value="processing">{{ t('status.processing') }}</option>
            <option value="backordered">{{ t('status.backordered') }}</option>
          </select>
        </div>
      </div>

      <button
        class="reset-filters-btn"
        @click="resetFilters"
        :disabled="!hasActiveFilters"
        :title="t('a11y.resetFilters')"
        :aria-label="t('a11y.resetFilters')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'

export default {
  name: 'FilterBar',
  setup() {
    const {
      selectedPeriod,
      selectedLocation,
      selectedCategory,
      selectedStatus,
      hasActiveFilters,
      resetFilters
    } = useFilters()

    const { t } = useI18n()

    return {
      t,
      selectedPeriod,
      selectedLocation,
      selectedCategory,
      selectedStatus,
      hasActiveFilters,
      resetFilters
    }
  }
}
</script>

<style scoped>
.filters-bar {
  background: var(--background);
  border-bottom: 1px solid var(--border);
  padding: var(--space-3) 0;
  position: sticky;
  top: var(--header-height);
  z-index: 90;
}

.filters-container {
  padding: 0 var(--space-8);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  /*
   * The four filter groups plus the reset button measure ~894px as a rigid
   * row. Under the old full-bleed header that was off-screen; inside the
   * sidebar's content column it overflowed the document at every width below
   * ~1000px. Wrapping here (and min-width:0 below) is what keeps the grid
   * column honest — minmax(0,1fr) on .app only stops the *grid* from being
   * blown out, it cannot make a rigid flex row shrink.
   */
  flex-wrap: wrap;
}

.filters-grid {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex: 1 1 auto;
  flex-wrap: wrap;
  min-width: 0;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1 1 auto;
  min-width: 0;
}

.filter-group label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--muted-foreground);
  white-space: nowrap;
}

.filter-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--input);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--foreground);
  background: var(--card);
  cursor: pointer;
  transition: border-color 150ms ease-out, background-color 150ms ease-out;
  font-weight: 500;
  min-width: 140px;
}

.filter-select:hover {
  border-color: var(--border-strong);
}

.filter-select:focus {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
  border-color: var(--border-strong);
}

.reset-filters-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--muted-foreground);
  cursor: pointer;
  transition: background-color 150ms ease-out, border-color 150ms ease-out,
    color 150ms ease-out;
  flex-shrink: 0;
}

.reset-filters-btn:hover:not(:disabled) {
  background: var(--background);
  border-color: var(--border-strong);
  color: var(--foreground);
}

.reset-filters-btn:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.reset-filters-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.reset-filters-btn svg {
  width: 18px;
  height: 18px;
}
</style>
