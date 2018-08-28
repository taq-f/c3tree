<template>
  <div id="app">
    <div class="treeview-wrapper">
      <TreeView :entries="entries" :draggable="draggable"/>
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
      draggable: true,
      entries: [
        {
          id: "1",
          text: "fooooo!",
          open: true,
          children: [
            {
              id: "2",
              text: "baaaaa!",
              open: true,
              children: [
                {
                  id: "4",
                  text: "4444444!"
                },
                {
                  id: "5",
                  text: "55555!"
                }
              ]
            },
            {
              id: "3",
              text: "quuuux!",
              open: true,
              children: [
                {
                  id: "6",
                  text: "66666!"
                }
              ]
            }
          ]
        }
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
