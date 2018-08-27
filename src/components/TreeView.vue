<template>
  <div class="treeview">
    <tree-view-entry
      v-for="entry of parsedEntries"
      :key="entry.id"
      :entry="entry"
      @select-entry="selectEntry">
    </tree-view-entry>
  </div>
</template>

<script>
import TreeViewEntry from '@/components/TreeViewEntry.vue'

export default {
  components: {
    TreeViewEntry
  },
  props: {
    entries: Array
  },
  data() {
    return {
      parsedEntries: this.parse(this.entries),  
    }
  },
  methods: {
    parse(originalEntries) {
      const result = []
      for (const node of originalEntries) {
        result.push(this.parseHelper(node, undefined))
      }
      return result
    },
    parseHelper(node, parent) {
      const newNode = {
        id: node.id,
        text: node.text,
        state: 'none',
        level: parent ? parent.level + 1 : 0,
      }
      if (node.children) {
        newNode.open = node.open
        newNode.children = []
      }
      if (parent) {
        parent.children.push(newNode)
      }

      if (node.children) {
        for (const child of node.children) {
          this.parseHelper(child, newNode)
        }
      }
      return newNode
    },
    selectEntry(entry) {
      console.log("click state", entry.text);
    }
  }
};
</script>

