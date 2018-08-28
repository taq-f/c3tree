<template>
  <div class="treeview">
    <tree-view-entry
      v-for="entry of parsedEntries"
      :key="entry.id"
      :level="0"
      :entry="entry"
      :draggable="draggable"
      :drag-prop="dragProp"
      @select-entry="selectEntry">
    </tree-view-entry>
  </div>
</template>

<script>
import TreeViewEntry from "@/components/TreeViewEntry.vue";

export default {
  components: {
    TreeViewEntry
  },
  props: {
    entries: Array,
    draggable: Boolean
  },
  data() {
    return {
      parsedEntries: this.entries ? this.parse(this.entries) : [],
      dragProp: {
        entry: undefined,
        dropped: false
      }
    };
  },
  methods: {
    parse(entries) {
      for (const node of entries) {
        this.parseHelper(node);
      }
      return entries;
    },
    parseHelper(node) {
      node.state = "none";
      if (node.children) {
        for (const child of node.children) {
          this.parseHelper(child);
        }
      }
    },
    selectEntry(entry) {
      console.log("click state", entry.text);
    }
  },
  watch: {
    entries() {
      this.parsedEntries = this.parse(this.entries);
    }
  }
};
</script>
