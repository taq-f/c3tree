<template>
  <div class="treeview">
    <tree-view-entry
      v-for="entry of parsedEntries"
      :key="entry.id"
      :level="0"
      :height="entryHeight"
      :entry="entry"
      :no-icon="noIcon"
      :no-check-icon="noCheckIcon"
      :draggable="draggable"
      :drag-prop="dragProp"
      :entry-state-change="entryStateChange">
      <template slot-scope="_">
        <slot :vm="_.vm" :entry="_.entry" >
          {{ _.entry.text }}
        </slot>
      </template>
    </tree-view-entry>
  </div>
</template>

<script>
import Vue from 'vue'
import Component from 'vue-class-component'
import TreeViewEntry from '@/components/treeview/TreeViewEntry.vue'
import '@/icons'

/**
 * Get ID assigned to each entry when not specified
 */
let psuedoId = 0
function getId() {
  const id = psuedoId.toString()
  psuedoId++
  return id
}

@Component({
  components: {
    TreeViewEntry,
  },
  props: {
    entries: Array,
    draggable: Boolean,
    noIcon: Boolean,
    noCheckIcon: Boolean,
    entryStateChange: {
      type: Function,
      default: () => {},
    },
    entryHeight: Number,
  },
})
export default class TreeView extends Vue {
  /**
   * Property holding drag and drop information
   */
  dragProp = {
    entry: undefined,
    dropped: false,
  }

  /**
   * Entries array that is actually passed to entry components
   */
  get parsedEntries() {
    const entries = this.entries || []
    for (const entry of entries) {
      this.parse(entry, false)
    }
    return entries
  }

  /**
   * Walk through entries and set necessary properties, such as state
   *
   * @param entry {Object} - An entry
   * @param isParentSelected {Boolean} - if parent is checked or not. A checked parent means this entry must be checked event given data is not "checked" state.
   */
  parse(entry, isParentSelected) {
    if (!entry.hasOwnProperty('id')) {
      // ID does not need to be reactive since it won't change
      entry.id = getId()
    }
    if (!entry.hasOwnProperty('state')) {
      this.$set(entry, 'state', 'none')
    }
    if (!entry.hasOwnProperty('open')) {
      this.$set(entry, 'open', false)
    }
    if (!entry.hasOwnProperty('disabled')) {
      this.$set(entry, 'disabled', false)
    }

    if (isParentSelected) {
      // the flag is not reset once becomes true
      entry.state = 'checked'
    } else {
      // if the flag is still false, override it by this entry state
      isParentSelected = entry.state === 'checked'
    }

    if (entry.children) {
      for (const child of entry.children) {
        this.parse(child, isParentSelected)
      }
    }
  }
}
</script>
