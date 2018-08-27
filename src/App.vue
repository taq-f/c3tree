<template>
  <div id="app">
    <div class="treeview-wrapper">
      <TreeView :entries="entries"/>
    </div>
  </div>
</template>

<script>
import TreeView from "./components/TreeView.vue";

export default {
  name: "app",
  components: {
    TreeView
  },
  data() {
    return {
      entries: [
        {
          id: "1",
          text: "fooooo!",
          open: true,
          children: [
            {
              id: "2",
              text: "baaaaa!",
              open: false,
              children: [
                {
                  id: "4",
                  text: "4444444!",
                  open: false,
                },
                {
                  id: "5",
                  text: "55555!",
                  open: false,
                }
              ]
            },
            {
              id: "3",
              text: "quuuux!",
              open: false,
              children: [
                {
                  id: "6",
                  text: "66666!",
                  open: false,
                }
              ]
            },
          ]
        },
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
.treeview-wrapper {
  width: 300px;
}
</style>
