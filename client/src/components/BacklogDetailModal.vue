<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen && backlogItem" class="modal-overlay" @click="close">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">Inventory Shortage Details</h3>
            <button class="close-button" @click="close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="shortage-header">
              <div class="shortage-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 8L24 28M24 34L24 36" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                  <circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="3"/>
                </svg>
              </div>
              <div class="shortage-title-section">
                <h4 class="item-name">{{ translateProductName(backlogItem.item_name) }}</h4>
                <div class="item-sku">SKU: {{ backlogItem.item_sku }}</div>
              </div>
              <span class="priority-badge" :class="backlogItem.priority">
                {{ backlogItem.priority }} Priority
              </span>
            </div>

            <div class="shortage-summary">
              <div class="summary-card danger">
                <div class="summary-label">Shortage Amount</div>
                <div class="summary-value">{{ shortage }} units</div>
              </div>
              <div class="summary-card warning">
                <div class="summary-label">Days Delayed</div>
                <div class="summary-value">{{ backlogItem.days_delayed }} days</div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Order ID</div>
                <div class="info-value order-id">{{ backlogItem.order_id }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">Item SKU</div>
                <div class="info-value sku">{{ backlogItem.item_sku }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">Quantity Needed</div>
                <div class="info-value">{{ backlogItem.quantity_needed }} units</div>
              </div>

              <div class="info-item">
                <div class="info-label">Quantity Available</div>
                <div class="info-value">{{ backlogItem.quantity_available }} units</div>
              </div>

              <div class="info-item">
                <div class="info-label">Expected Date</div>
                <div class="info-value">{{ formatDate(backlogItem.expected_date) }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">
                  <span class="badge danger">Backordered</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="close">Close</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from '../composables/useI18n'

const { translateProductName } = useI18n()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  backlogItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const shortage = computed(() => {
  if (!props.backlogItem) return 0
  return props.backlogItem.quantity_needed - props.backlogItem.quantity_available
})

const close = () => {
  emit('close')
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgb(0 0 0 / 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--space-4);
}

.modal-container {
  background: var(--card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 1px solid var(--border);
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--foreground);
  letter-spacing: -0.025em;
}

.close-button {
  background: none;
  border: none;
  color: var(--muted-foreground);
  cursor: pointer;
  padding: var(--space-2);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: background-color 0.15s ease, color 0.15s ease;
  min-width: 40px;
  min-height: 40px;
}

.close-button:hover {
  background: var(--muted);
  color: var(--foreground);
}

.close-button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-8);
}

.shortage-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--border);
  margin-bottom: var(--space-6);
}

.shortage-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--red-9) 0%, var(--red-10) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.shortage-title-section {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--foreground);
  margin: 0 0 var(--space-2) 0;
}

.item-sku {
  font-size: var(--text-sm);
  color: var(--muted-foreground);
  font-family: 'Monaco', 'Courier New', monospace;
}

.priority-badge {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  flex-shrink: 0;
  border: 1px solid;
}

.priority-badge.high {
  background: var(--red-3);
  color: var(--red-12);
  border-color: var(--red-6);
}

.priority-badge.medium {
  background: var(--amber-3);
  color: var(--amber-12);
  border-color: var(--amber-6);
}

.priority-badge.low {
  background: var(--blue-3);
  color: var(--blue-12);
  border-color: var(--blue-6);
}

.shortage-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.summary-card {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 2px solid;
}

.summary-card.danger {
  border-color: var(--red-6);
  background: var(--red-2);
}

.summary-card.warning {
  border-color: var(--amber-6);
  background: var(--amber-2);
}

.summary-label {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted-foreground);
  margin-bottom: var(--space-2);
}

.summary-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--foreground);
  font-variant-numeric: tabular-nums;
}

.summary-card.danger .summary-value {
  color: var(--red-11);
}

.summary-card.warning .summary-value {
  color: var(--amber-11);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-6);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.info-label {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted-foreground);
}

.info-value {
  font-size: var(--text-sm);
  color: var(--foreground);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.info-value.order-id,
.info-value.sku {
  font-family: 'Monaco', 'Courier New', monospace;
  color: var(--primary);
}

.modal-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.btn-secondary {
  padding: var(--space-2) var(--space-4);
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: var(--text-sm);
  color: var(--foreground);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  font-family: inherit;
}

.btn-secondary:hover {
  background: var(--muted);
  border-color: var(--border-strong);
}

.badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  border: 1px solid;
  font-variant-numeric: tabular-nums;
}

.badge.danger {
  background: var(--red-3);
  color: var(--red-12);
  border-color: var(--red-6);
}

.badge.warning {
  background: var(--amber-3);
  color: var(--amber-12);
  border-color: var(--amber-6);
}

.badge.success {
  background: var(--green-3);
  color: var(--green-12);
  border-color: var(--green-6);
}

/* Modal transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>
