<template>
  <div class="treeview">
    <tree-view-entry
      v-for="entry of parsedEntries"
      :key="entry.id"
      :level="0"
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
import TreeViewEntry from '@/components/treeview/TreeViewEntry.vue'

export default {
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
  },
  data() {
    return {
      dragProp: {
        entry: undefined,
        dropped: false,
      },
      psuedoId: 0,
    }
  },
  computed: {
    parsedEntries() {
      return this.parse(this.entries || [])
    },
  },
  methods: {
    selectEntry(id) {
      const entry = this.cache.get(id)
      if (entry) {
        entry.state = 'checked'
      }
    },
    parse(entries) {
      for (const node of entries) {
        this.parseHelper(node, false)
      }
      return entries
    },
    parseHelper(node, isAncestorChecked) {
      if (!node.hasOwnProperty('id')) {
        // ID does not need to be reactive since it won't change
        node.id = this.psuedoId.toString()
        this.psuedoId++
      }
      if (!node.hasOwnProperty('state')) {
        this.$set(node, 'state', 'none')
      }
      if (!node.hasOwnProperty('open')) {
        Vue.set(node, 'open', false)
      }
      if (!node.hasOwnProperty('disabled')) {
        Vue.set(node, 'disabled', false)
      }

      if (isAncestorChecked) {
        // the flag is not reset once becomes true
        node.state = 'checked'
      } else {
        // if the flag is still false, override it by this node state
        isAncestorChecked = node.state === 'checked'
      }

      this.cache.set(node.id, node)

      if (node.children) {
        for (const child of node.children) {
          this.parseHelper(child, isAncestorChecked)
        }
      }
    },
  },
  created() {
    this.cache = new Map()
  },
}
</script>
