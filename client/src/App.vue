<template>
  <div class="app" :data-sidebar="dataSidebar">
    <a class="skip-link" href="#main">{{ t('a11y.skipToContent') }}</a>

    <SidebarNav ref="sidebarRef" :collapsed="sidebarCollapsed" @toggle-collapse="toggleSidebar" />

    <div class="scrim" v-show="mobileSidebarOpen" @click="closeMobileSidebar"></div>

    <div class="content-col">
      <div class="topbar">
        <button
          ref="sidebarToggleRef"
          type="button"
          class="sidebar-toggle"
          :aria-expanded="sidebarToggleExpanded.toString()"
          aria-controls="app-sidebar"
          :aria-label="t('a11y.toggleNav')"
          @click="toggleSidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div class="topbar-actions">
          <LanguageSwitcher />
          <ProfileMenu
            @show-profile-details="showProfileDetails = true"
            @show-tasks="showTasks = true"
          />
        </div>
      </div>

      <FilterBar />

      <main id="main" class="main-content">
        <router-view />
      </main>
    </div>

    <ProfileDetailsModal
      :is-open="showProfileDetails"
      @close="showProfileDetails = false"
    />

    <TasksModal
      :is-open="showTasks"
      :tasks="tasks"
      @close="showTasks = false"
      @add-task="addTask"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import FilterBar from './components/FilterBar.vue'
import ProfileMenu from './components/ProfileMenu.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import SidebarNav from './components/SidebarNav.vue'

export default {
  name: 'App',
  components: {
    FilterBar,
    ProfileMenu,
    ProfileDetailsModal,
    TasksModal,
    LanguageSwitcher,
    SidebarNav
  },
  setup() {
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const route = useRoute()
    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])

    // --- Sidebar shell state -------------------------------------------
    // `sidebarCollapsed` is the desktop (>=1024px) rail toggle. `mobileSidebarOpen`
    // is the <768px off-canvas drawer. They are independent concepts that happen
    // to share one toggle control, disambiguated at click-time by viewport width.
    const sidebarCollapsed = ref(false)
    const mobileSidebarOpen = ref(false)
    const isMobileViewport = ref(false)
    const sidebarToggleRef = ref(null)
    const sidebarRef = ref(null)
    let mobileMql = null

    const FOCUSABLE_SELECTOR =
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

    // Visible = actually rendered in the layout (offsetParent is null for
    // display:none or detached nodes). The drawer itself is `position:
    // fixed`, so this stays true while it's open even though it's translated
    // on/off screen.
    const getFocusableInSidebar = () => {
      const container = sidebarRef.value?.$el
      if (!container) return []
      return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null
      )
    }

    const updateViewport = (e) => {
      isMobileViewport.value = e ? e.matches : mobileMql.matches
    }

    const dataSidebar = computed(() => {
      if (mobileSidebarOpen.value) return 'open'
      return sidebarCollapsed.value ? 'collapsed' : null
    })

    // Drives aria-expanded on the topbar toggle: on mobile it reflects the
    // drawer, on desktop/tablet it reflects the expanded/collapsed rail.
    const sidebarToggleExpanded = computed(() =>
      isMobileViewport.value ? mobileSidebarOpen.value : !sidebarCollapsed.value
    )

    const toggleSidebar = () => {
      if (isMobileViewport.value) {
        mobileSidebarOpen.value = !mobileSidebarOpen.value
      } else {
        sidebarCollapsed.value = !sidebarCollapsed.value
      }
    }

    const closeMobileSidebar = () => {
      if (!mobileSidebarOpen.value) return
      mobileSidebarOpen.value = false
      nextTick(() => sidebarToggleRef.value?.focus())
    }

    // Hand-rolled focus trap for the mobile drawer. Gated on BOTH the open
    // state and the viewport (matchMedia, not just window width at call
    // time) so it can never engage at >=768px, where the sidebar is in
    // normal document flow and trapping focus there would strand the user.
    const trapFocus = (e) => {
      if (!mobileSidebarOpen.value || !isMobileViewport.value) return
      const focusable = getFocusableInSidebar()
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        closeMobileSidebar()
      } else if (e.key === 'Tab') {
        trapFocus(e)
      }
    }

    // Move focus into the drawer when it opens (mobile only). Falls back to
    // the drawer container itself if, for some reason, nothing inside is
    // focusable.
    watch(mobileSidebarOpen, (open) => {
      if (!open || !isMobileViewport.value) return
      nextTick(() => {
        const focusable = getFocusableInSidebar()
        ;(focusable[0] || sidebarRef.value?.$el)?.focus()
      })
    })

    // Close the drawer after navigating so it doesn't stay open over the
    // next page on mobile.
    watch(() => route.fullPath, () => closeMobileSidebar())

    onMounted(() => {
      mobileMql = window.matchMedia('(max-width: 767px)')
      updateViewport()
      mobileMql.addEventListener('change', updateViewport)
      window.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
      mobileMql?.removeEventListener('change', updateViewport)
      window.removeEventListener('keydown', handleKeydown)
    })

    // Merge mock tasks from currentUser with API tasks
    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        // Add new task to the beginning of the array
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const isMockTask = currentUser.value.tasks.some(t => t.id === taskId)

        if (isMockTask) {
          // Remove from mock tasks
          const index = currentUser.value.tasks.findIndex(t => t.id === taskId)
          if (index !== -1) {
            currentUser.value.tasks.splice(index, 1)
          }
        } else {
          // Remove from API tasks
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter(t => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const mockTask = currentUser.value.tasks.find(t => t.id === taskId)

        if (mockTask) {
          // Toggle mock task status
          mockTask.status = mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          // Toggle API task
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            apiTasks.value[index] = updatedTask
          }
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    onMounted(loadTasks)

    return {
      t,
      showProfileDetails,
      showTasks,
      tasks,
      addTask,
      deleteTask,
      toggleTask,
      sidebarCollapsed,
      mobileSidebarOpen,
      sidebarToggleRef,
      sidebarRef,
      dataSidebar,
      sidebarToggleExpanded,
      toggleSidebar,
      closeMobileSidebar
    }
  }
}
</script>

<style>
:root {
  /* Neutral — Radix Slate (light) */
  --slate-1:  #fcfcfd;  --slate-2:  #f9f9fb;  --slate-3:  #f0f0f3;  --slate-4:  #e8e8ec;
  --slate-5:  #e0e1e6;  --slate-6:  #d9d9e0;  --slate-7:  #cdced6;  --slate-8:  #b9bbc6;
  --slate-9:  #8b8d98;  --slate-10: #80838d;  --slate-11: #60646c;  --slate-12: #1c2024;

  /* Accent — Radix Blue (light) */
  --blue-1:   #fbfdff;  --blue-2:   #f4faff;  --blue-3:   #e6f4fe;  --blue-4:   #d5efff;
  --blue-5:   #c2e5ff;  --blue-6:   #acd8fc;  --blue-7:   #8ec8f6;  --blue-8:   #5eb1ef;
  --blue-9:   #0090ff;  --blue-10:  #0588f0;  --blue-11:  #0d74ce;  --blue-12:  #113264;

  /* Status — Radix Green / Amber / Red (light) */
  --green-1:  #fbfefc;  --green-2:  #f4fbf6;  --green-3:  #e6f6eb;  --green-4:  #d6f1df;
  --green-5:  #c4e8d1;  --green-6:  #adddc0;  --green-7:  #8eceaa;  --green-8:  #5bb98b;
  --green-9:  #30a46c;  --green-10: #2b9a66;  --green-11: #218358;  --green-12: #193b2d;

  --amber-1:  #fefdfb;  --amber-2:  #fefbe9;  --amber-3:  #fff7c2;  --amber-4:  #ffee9c;
  --amber-5:  #fbe577;  --amber-6:  #f3d673;  --amber-7:  #e9c162;  --amber-8:  #e2a336;
  --amber-9:  #ffc53d;  --amber-10: #ffba18;  --amber-11: #ab6400;  --amber-12: #4f3422;

  --red-1:    #fffcfc;  --red-2:    #fff7f7;  --red-3:    #feebec;  --red-4:    #ffdbdc;
  --red-5:    #ffcdce;  --red-6:    #fdbdbe;  --red-7:    #f4a9aa;  --red-8:    #eb8e90;
  --red-9:    #e5484d;  --red-10:   #dc3e42;  --red-11:   #ce2c31;  --red-12:   #641723;

  /* Semantic layer */
  --background:             var(--slate-2);
  --foreground:             var(--slate-12);
  --card:                   #ffffff;
  --card-foreground:        var(--slate-12);
  --popover:                #ffffff;
  --popover-foreground:     var(--slate-12);
  --muted:                  var(--slate-3);
  --muted-foreground:       var(--slate-11);
  --accent:                 var(--slate-4);
  --accent-foreground:      var(--slate-12);
  --primary:                var(--blue-11);
  --primary-foreground:     #ffffff;
  --destructive:            var(--red-11);
  --destructive-foreground: #ffffff;
  --border:                 var(--slate-6);
  --border-strong:          var(--slate-9);
  --input:                  var(--slate-9);
  --ring:                   var(--blue-9);

  --sidebar:                      #ffffff;
  --sidebar-foreground:           var(--slate-11);
  --sidebar-primary:              var(--blue-11);
  --sidebar-primary-foreground:   #ffffff;
  --sidebar-accent:               var(--slate-4);
  --sidebar-accent-foreground:    var(--slate-12);
  --sidebar-border:               var(--slate-6);
  --sidebar-ring:                 var(--blue-9);

  /* Layout */
  --header-height: 56px;
  --sidebar-width: 256px;
  --sidebar-width-collapsed: 56px; /* [convention] 40px nav button + 8px padding each side, see shell.md */
  --filter-bar-height: 64px;       /* [convention] sticky filter bar box, snapped to the 64px step */

  /* Spacing scale — 4px base */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
  --space-6: 24px;  --space-8: 32px;  --space-12: 48px; --space-16: 64px;

  /* Type scale */
  --text-xs: 12px;  --text-sm: 14px;  --text-base: 16px; --text-lg: 18px;
  --text-xl: 20px;  --text-2xl: 24px; --text-3xl: 30px;  --text-4xl: 36px;

  /* Radius scale */
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px;

  /* Elevation */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06);
  --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.04), 0 4px 12px -2px rgb(0 0 0 / 0.08);
  --shadow-lg: 0 4px 8px -2px rgb(0 0 0 / 0.05), 0 12px 32px -4px rgb(0 0 0 / 0.12);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--background);
  color: var(--foreground);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: 100vh;
}

.app[data-sidebar='collapsed'] {
  --sidebar-width: var(--sidebar-width-collapsed);
}

/*
 * SC 2.4.11 Focus Not Obscured (Minimum), AA: the topbar (--header-height)
 * and, below it, the sticky filter bar can together cover a focused element
 * as the page scrolls. Both offsets resolve through variables so the number
 * appears exactly once. --filter-bar-height is a [convention] derived from the
 * bar's own box (var(--space-3) padding top and bottom + a ~36px control +
 * 1px border), snapped up to the 64px spacing step; it is not a measured spec.
 * Applied globally so it protects every route's focusable content, not just
 * the files edited in this pass.
 */
a,
button:not([disabled]),
input,
select,
textarea,
[tabindex]:not([tabindex='-1']) {
  scroll-margin-top: calc(var(--header-height) + var(--filter-bar-height));
}

/* First focusable element on the page (WCAG 2.4.1). Hidden until focused. */
.skip-link {
  position: absolute;
  left: var(--space-2);
  top: var(--space-2);
  transform: translateY(-150%);
  background: var(--primary);
  color: var(--primary-foreground);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 600;
  z-index: 300;
  transition: transform 100ms ease-out;
}

.skip-link:focus {
  transform: translateY(0);
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.scrim {
  display: none;
}

.content-col {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 90;
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-8);
  background: var(--card);
  border-bottom: 1px solid var(--border);
}

.sidebar-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--foreground);
  cursor: pointer;
  transition-property: background-color, color;
  transition-duration: 100ms;
  transition-timing-function: ease-out;
}

.sidebar-toggle svg {
  width: 20px;
  height: 20px;
}

.sidebar-toggle:hover {
  background: var(--muted);
}

.sidebar-toggle:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.topbar-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* Single wrapper owning max-width + horizontal padding for the content
   column (Phase 0 found three of these; this is the one that survives). */
.main-content {
  flex: 1;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: var(--space-6) var(--space-8);
}

@media (max-width: 1023px) {
  :root {
    --sidebar-width: var(--sidebar-width-collapsed);
  }
}

@media (max-width: 767px) {
  .app {
    grid-template-columns: minmax(0, 1fr);
  }

  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: 288px;
    height: 100vh;
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 200ms ease-out;
  }

  .app[data-sidebar='open'] .sidebar {
    transform: translateX(0);
  }

  .scrim {
    display: block;
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 0.4);
    z-index: 150;
    opacity: 0;
    pointer-events: none;
    transition: opacity 200ms ease-out;
  }

  .app[data-sidebar='open'] .scrim {
    opacity: 1;
    pointer-events: auto;
  }
}

.page-header {
  margin-bottom: var(--space-6);
}

.page-header h2 {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--foreground);
  margin-bottom: var(--space-1);
  letter-spacing: -0.025em;
}

.page-header p {
  color: var(--muted-foreground);
  font-size: var(--text-sm);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.stat-card {
  background: var(--card);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
}

.stat-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-sm);
}

.stat-label {
  color: var(--muted-foreground);
  font-size: var(--text-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-2);
}

.stat-value {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--foreground);
  letter-spacing: -0.025em;
}

.stat-card.warning .stat-value {
  color: var(--amber-11);
}

.stat-card.success .stat-value {
  color: var(--green-11);
}

.stat-card.danger .stat-value {
  color: var(--destructive);
}

.stat-card.info .stat-value {
  color: var(--primary);
}

.card {
  background: var(--card);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  border: 1px solid var(--border);
  margin-bottom: var(--space-4);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--foreground);
  letter-spacing: -0.025em;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--muted);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

th {
  text-align: left;
  padding: var(--space-2) var(--space-3);
  font-weight: 600;
  color: var(--muted-foreground);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: var(--space-2) var(--space-3);
  border-top: 1px solid var(--muted);
  color: var(--foreground);
  font-size: var(--text-sm);
}

tbody tr {
  transition: background-color 0.15s ease;
}

tbody tr:hover {
  background: var(--muted);
}

.badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.success {
  background: var(--green-3);
  color: var(--green-12);
  border: 1px solid var(--green-6);
}

.badge.warning {
  background: var(--amber-3);
  color: var(--amber-12);
  border: 1px solid var(--amber-6);
}

.badge.danger {
  background: var(--red-3);
  color: var(--red-12);
  border: 1px solid var(--red-6);
}

.badge.info {
  background: var(--blue-3);
  color: var(--blue-12);
  border: 1px solid var(--blue-6);
}

.badge.increasing {
  background: var(--green-3);
  color: var(--green-12);
  border: 1px solid var(--green-6);
}

.badge.decreasing {
  background: var(--red-3);
  color: var(--red-12);
  border: 1px solid var(--red-6);
}

.badge.stable {
  background: var(--blue-3);
  color: var(--blue-12);
  border: 1px solid var(--blue-6);
}

.badge.high {
  background: var(--red-3);
  color: var(--red-12);
  border: 1px solid var(--red-6);
}

.badge.medium {
  background: var(--amber-3);
  color: var(--amber-12);
  border: 1px solid var(--amber-6);
}

.badge.low {
  background: var(--blue-3);
  color: var(--blue-12);
  border: 1px solid var(--blue-6);
}

.loading {
  text-align: center;
  padding: var(--space-12);
  color: var(--muted-foreground);
  font-size: var(--text-sm);
}

.error {
  background: var(--red-2);
  border: 1px solid var(--red-6);
  color: var(--red-12);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  margin: var(--space-4) 0;
  font-size: var(--text-sm);
}
</style>
