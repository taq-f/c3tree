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
      parsedEntries: this.parse(this.entries),
      dragProp: {
        entry: undefined,
        dropped: false
      }
    };
  },
  methods: {
    parse(originalEntries) {
      const result = [];
      for (const node of originalEntries) {
        result.push(this.parseHelper(node, undefined));
      }
      return result;
    },
    parseHelper(node, parent) {
      const newNode = {
        id: node.id,
        text: node.text,
        state: "none"
      };
      if (node.children) {
        newNode.open = node.open;
        newNode.children = [];
      }
      if (parent) {
        parent.children.push(newNode);
      }

      if (node.children) {
        for (const child of node.children) {
          this.parseHelper(child, newNode);
        }
      }
      return newNode;
    },
    selectEntry(entry) {
      console.log("click state", entry.text);
    }
  }
};
</script>
