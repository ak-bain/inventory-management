<template>
  <nav id="app-sidebar" class="sidebar" :class="{ 'is-collapsed': collapsed }" :aria-label="t('a11y.mainNav')">
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-mark" aria-hidden="true">{{ t('nav.companyName').charAt(0) }}</span>
        <div class="logo-text">
          <h1>{{ t('nav.companyName') }}</h1>
          <span class="subtitle">{{ t('nav.subtitle') }}</span>
        </div>
      </div>

      <button
        type="button"
        class="collapse-toggle"
        :aria-expanded="(!collapsed).toString()"
        aria-controls="app-sidebar-nav-list"
        :aria-label="collapsed ? t('a11y.expandSidebar') : t('a11y.collapseSidebar')"
        @click="$emit('toggle-collapse')"
      >
        <svg
          class="icon"
          :class="{ 'icon-flipped': collapsed }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="9" y1="4" x2="9" y2="20" />
          <path d="M14 9l-3 3 3 3" />
        </svg>
      </button>
    </div>

    <ul id="app-sidebar-nav-list" class="nav-list">
      <li v-for="item in navItems" :key="item.path">
        <router-link :to="item.path" class="nav-item" exact-active-class="is-active">
          <span class="nav-icon" aria-hidden="true">
            <svg
              v-if="item.icon === 'overview'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="8" height="8" rx="1.5" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" />
            </svg>
            <svg
              v-else-if="item.icon === 'inventory'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 7.5L12 3l9 4.5M3 7.5V16.5L12 21l9-4.5V7.5M3 7.5L12 12m0 0l9-4.5M12 12V21" />
            </svg>
            <svg
              v-else-if="item.icon === 'orders'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="6" y="4" width="12" height="17" rx="2" />
              <rect x="9" y="2" width="6" height="3" rx="1" />
              <line x1="9" y1="11" x2="15" y2="11" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <svg
              v-else-if="item.icon === 'finance'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="4" y1="19" x2="4" y2="10" />
              <line x1="10" y1="19" x2="10" y2="5" />
              <line x1="16" y1="19" x2="16" y2="13" />
              <line x1="4" y1="19" x2="20" y2="19" />
            </svg>
            <svg
              v-else-if="item.icon === 'demand'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 17l6-6 4 4 8-8" />
              <path d="M15 7h6v6" />
            </svg>
            <svg
              v-else-if="item.icon === 'reports'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="5" y="3" width="14" height="18" rx="2" />
              <line x1="8" y1="8" x2="16" y2="8" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="8" y1="16" x2="13" y2="16" />
            </svg>
          </span>
          <span class="nav-label">{{ t(item.labelKey) }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})
defineEmits(['toggle-collapse'])

const router = useRouter()
const { t } = useI18n()

// Nav items are derived from the route table's meta.nav so the route
// declarations stay the single source of truth (see main.js). Routes
// without meta.nav (e.g. an orphaned view) never appear here.
const navItems = computed(() =>
  router
    .getRoutes()
    .filter(r => r.meta && r.meta.nav)
    .sort((a, b) => a.meta.nav.order - b.meta.nav.order)
    .map(r => ({ path: r.path, ...r.meta.nav }))
)
</script>

<style scoped>
.sidebar {
  background: var(--sidebar);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  padding: var(--space-2);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  margin-bottom: var(--space-2);
}

.logo {
  display: flex;
  align-items: center;
  /*
   * The 256px rail leaves ~135px for the wordmark once the logo mark, gap and
   * collapse toggle are subtracted, but the title needs 160px and the subtitle
   * 175px. Reclaiming width here (tighter gap, 28px mark) plus the smaller
   * title size below is what stops both lines rendering as ellipses.
   */
  gap: var(--space-1);
  min-width: 0;
  flex: 1;
}

.logo-mark {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  background: var(--sidebar-primary);
  color: var(--sidebar-primary-foreground);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--text-sm);
}

.logo-text {
  min-width: 0;
  overflow: hidden;
}

.logo-text h1 {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--foreground);
  letter-spacing: -0.025em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logo-text .subtitle {
  display: block;
  font-size: var(--text-xs);
  color: var(--muted-foreground);
  /* Wraps to a second line rather than ellipsing; at 12px it cannot fit the
     rail on one line at any title size we'd accept. */
  line-height: 1.3;
}

.collapse-toggle {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--sidebar-foreground);
  cursor: pointer;
  transition-property: background-color, color;
  transition-duration: 100ms;
  transition-timing-function: ease-out;
}

.collapse-toggle:hover {
  background: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
}

.collapse-toggle:focus-visible {
  outline: 2px solid var(--sidebar-ring);
  outline-offset: 2px;
}

.icon {
  width: 20px;
  height: 20px;
}

.icon-flipped {
  transform: scaleX(-1);
}

.nav-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  padding: 0 var(--space-2);
  border-radius: var(--radius-md);
  color: var(--sidebar-foreground);
  font-size: var(--text-sm);
  font-weight: 500;
  text-decoration: none;
  transition-property: background-color, color;
  transition-duration: 100ms;
  transition-timing-function: ease-out;
}

.nav-item:hover {
  background: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
}

.nav-item:focus-visible {
  outline: 2px solid var(--sidebar-ring);
  outline-offset: 2px;
}

/* Active state: tinted fill + heavier weight, never color alone (WCAG SC 1.4.1). */
.nav-item.is-active {
  background: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
  font-weight: 600;
}

.nav-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  width: 20px;
  height: 20px;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Collapsed rail (desktop, user-toggled): labels keep an accessible name
   but are visually hidden rather than removed from the DOM. */
.sidebar.is-collapsed .logo-text,
.sidebar.is-collapsed .nav-label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sidebar.is-collapsed .nav-item {
  justify-content: center;
}

/* Tablet: forced icon rail regardless of the collapse toggle state. */
@media (max-width: 1023px) {
  .logo-text,
  .nav-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .nav-item {
    justify-content: center;
  }
}

/* Mobile drawer: always full width, labels always visible regardless of
   the desktop collapse state or the tablet override above. */
@media (max-width: 767px) {
  .logo-text,
  .nav-label {
    position: static;
    width: auto;
    height: auto;
    padding: 0;
    margin: 0;
    overflow: hidden;
    clip: auto;
    white-space: nowrap;
    border: 0;
  }

  .nav-item {
    justify-content: flex-start;
  }
}
</style>
