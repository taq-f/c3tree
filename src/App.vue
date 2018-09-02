<template>
  <div id="app">
    <button @click="changeData">Change Data</button>
    <button @click="selectEntry">Select Entry</button>
    <input type="text" v-model="filterText" />
    <button @click="filter(entries)">Filter</button>
    <div class="treeview-wrapper">
      <TreeView
        ref="tree"
        :entries="entries"
        :draggable="draggable"
        :no-icon="noIcon"
        :no-check-icon="noCheckIcon">
        <!-- <template slot-scope="slotProps">
          {{ slotProps.entry.data.name }}
        </template> -->
      </TreeView>
    </div>
  </div>
</template>

<script>
import TreeView from './components/treeview/TreeView.vue'

export default {
  name: 'app',
  components: {
    TreeView,
  },
  methods: {
    changeData() {
      const entry = this.entries[0].children[0].children[0]
      entry.state = 'checked'
    },
    onEntryStateChange(entry) {
      console.log('onEntryStateChange', entry)
    },
    selectEntry() {
      this.$refs.tree.selectEntry('2')
    },
    filter() {
      const text = this.filterText
      for (const entry of this.entries) {
        this.fileterHelper(entry, text)
      }
    },
    fileterHelper(entry, text) {
      if (!entry.children) {
        if (entry.text.includes(text)) {
          entry.disabled = false
        } else {
          entry.disabled = true
        }
      } else {
        for (const child of entry.children) {
          this.fileterHelper(child, text)
        }
        // diable parent when all children are disabled
        entry.disabled = entry.children.map(c => c.disabled).every(d => d)
      }
    },
  },
  mounted() {
    fetch('tree.json')
      .then(r => r.json())
      .then(json => (this.entries = json))
  },
  data() {
    return {
      draggable: true,
      noIcon: false,
      noCheckIcon: false,
      entries: [],
      filterText: '国産',
    }
  },
}
</script>

<style lang="scss" scoped>
.treeview-wrapper {
  width: 600px;
}
</style>
