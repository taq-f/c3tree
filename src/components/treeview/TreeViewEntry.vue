<template>
  <div class="wrapper">
    <div class="entry"
      :style="entryStyle"
      :class="entryCssClass"
      :draggable="draggable"
      @dragstart="dragStart(entry, $event)"
      @dragover="dragOver(entry, $event)"
      @dragenter="dragEnter(entry, $event)"
      @dragleave="dragLeave(entry, $event)"
      @drop="drop(entry, $event)"
      @dragend="dragEnd(entry, $event)"
      ref="entry">
      <div class="entry-element caret" @click.stop="toggleOpenClose">
        <i class="icon-caret icon-close fas fa-fw fa-caret-right"></i>
        <i class="icon-caret icon-open fas fa-fw fa-caret-down"></i>
      </div>
      <div v-if="!noCheckIcon" class="entry-element check" @click="select">
        <checkbox :state="entry.state"></checkbox>
      </div>
      <div v-if="!noIcon && entry.children" class="entry-element icon-folder" @click="select">
        <i class="folder-icon folder-close fas fa-fw fa-folder"></i>
        <i class="folder-icon folder-open fas fa-fw fa-folder-open"></i>
      </div>
      <div class="entry-element" @click="select">
        <slot :vm="this" :entry="entry">
          {{ entry.text }}
        </slot>
      </div>
    </div>

    <!-- <height-expand-transition> -->
    <transition name="expand" @before-enter="beforeEnter" @after-enter="afterEnter" @before-leave="beforeLeave" @after-leave="afterLeave" >
      <div v-if="entry.open" class="children-container" :style="childrenContainerStyle">
        <tree-view-entry
          ref="children"
          v-for="child of entry.children"
          :key="child.id"
          :entry="child"
          :level="level + 1"
          :no-icon="noIcon"
          :no-check-icon="noCheckIcon"
          :draggable="draggable"
          :drag-prop="dragProp"
          :entry-state-change="entryStateChange"
          @open-change="handleChildOpenChange"
          @entry-status-change="handleChildSelect"
          @drag-end="childDragEnd">
          <template slot-scope="_">
            <slot :vm="_.vm" :entry="_.entry" >
              {{ _.entry.text }}
            </slot>
          </template>
        </tree-view-entry>
      </div>
    </transition>
    <!-- </height-expand-transition> -->
  </div>
</template>

<script>
import Checkbox from '@/components/treeview/Checkbox.vue'
import HeightExpandTransition from '@/components/treeview/HeightExpandTransition.vue'

export default {
  components: {
    Checkbox,
    HeightExpandTransition,
  },
  name: 'tree-view-entry',
  props: {
    entry: Object,
    level: Number,
    noIcon: Boolean,
    noCheckIcon: Boolean,
    draggable: Boolean,
    dragProp: Object,
    entryStateChange: Function,
  },
  data() {
    return {
      height: 30,
      childHeight: 0,
      dropEffect: false,
    }
  },
  computed: {
    entryStyle() {
      return {
        height: `${this.height}px`,
        paddingLeft: `${this.level * 20}px`,
      }
    },
    entryCssClass() {
      return {
        open: this.entry.open,
        'has-children': this.entry.children,
        selected: this.entry.state === 'checked',
        disabled: this.entry.disabled,
        'drop-effect': this.dropEffect,
      }
    },
    childrenContainerStyle() {
      return {
        height: `${this.childHeight}px`,
      }
    },
  },
  watch: {
    'entry.state': {
      deep: false,
      handler() {
        if (this.entry.doNotWatch) {
          delete this.entry.doNotWatch
          return
        } else {
          this.$emit('entry-status-change', this.entry)
        }
      },
    },
    // 'entry.open': {
    //   deep: true,
    //   handler(newVal, oldVal) {
    //     this.handleGroupMaxHeight()
    //   },
    // },
  },
  methods: {
    /**
     * Toggle open/close state of this entry
     */
    toggleOpenClose() {
      this.entry.open = !this.entry.open
    },
    /**
     * Select this entry
     */
    select() {
      if (this.entry.disabled) {
        return
      }

      let toState
      switch (this.entry.state) {
        case 'none':
          toState = 'checked'
          break
        case 'intermediate':
          toState = 'checked'
          break
        case 'checked':
          toState = 'none'
          break
        default:
          // TODO error
          break
      }

      this.entryStateChange(this.entry)
      this.setState(this.entry, toState)
    },
    /**
     * Handle child's state change
     */
    handleChildSelect() {
      // when check state of a child component changed,
      // check to see if all/some/none of them are selected and
      // change this own state depending on them.
      const states = new Set(this.entry.children.map(c => c.state))
      if (states.size > 1) {
        this.entry.state = 'intermediate'
      } else {
        this.entry.state = this.entry.children[0].state
      }
    },
    /**
     * Set state of an entry.
     *
     * The states of children are also set recursively.
     */
    setState(entry, state) {
      entry.state = state
      if (entry.children) {
        for (const child of entry.children) {
          child.doNotWatch = true
          this.setState(child, state)
        }
      }
    },
    handleGroupMaxHeight() {
      if (this.entry.open) {
        if (this.$refs.children) {
          let childHeight = 0
          for (const child of this.$refs.children) {
            if (child.entry.children) {
              childHeight += child.childHeight + child.height
            } else {
              childHeight += child.height
            }
          }
          this.childHeight = childHeight
        }
      } else {
        this.childHeight = 0
      }
      this.$emit('open-change')
    },
    handleChildOpenChange() {
      this.handleGroupMaxHeight()
      this.$emit('open-change')
    },
    beforeEnter() {
      console.log('BEFORE EBNTER', this.$refs.children.length)
    },
    afterEnter() {
      console.log('AFTER EBNTER', this.$refs.children.length)
      // this.handleGroupMaxHeight()
    },
    beforeLeave() {
      console.log('BEFORE Leave', this.$refs.children.length)
    },
    afterLeave() {
      console.log('AFTER Leave', this.$refs.children.length)
      // this.handleGroupMaxHeight()
    },
    dragStart(entry) {
      // register the entry starts being dragged,
      // so that referenced afterward (from another entry).
      this.dragProp.entry = entry
      this.dragProp.dropped = false
    },
    dragOver(entry, event) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      return false
    },
    dragEnter(entry, { target }) {
      if (this.$refs.entry !== target) {
        return
      }
      if (this.dragProp.entry === entry) {
        // not allowed to drop to self.
        return
      } else if (!entry.children) {
        // not allowed to drop into leaf.
        return
      }
      this.dropEffect = true
    },
    dragLeave(entry, { target }) {
      if (this.$refs.entry !== target) {
        return
      }
      this.dropEffect = false
    },
    drop(entry, event) {
      event.preventDefault()

      const dragging = this.dragProp.entry
      if (dragging === entry) {
        // not allowed to drop to self.
        return
      } else if (!entry.children) {
        // not allowed to drop into leaf.
        return
      }

      this.dragProp.dropped = true
      entry.children = [...entry.children, this.dragProp.entry]
    },
    dragEnd(entry) {
      if (this.dragProp.dropped) {
        // custom drag-end event should be fired when
        // actual entry drop happened.
        this.$emit('drag-end', entry)
      }
    },
    childDragEnd(entry) {
      // the entry has moved to another entry,
      // so delete it from self children.
      this.entry.children = this.entry.children.filter(c => c.id !== entry.id)
    },
  },
  mounted() {
    if (this.entry.children) {
      this.handleGroupMaxHeight()
    }
  },
}
</script>

<style lang="scss" scoped>
.entry {
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
  white-space: nowrap;
  transition: background-color 120ms ease;

  &.has-children {
    &.open {
      .icon-close,
      .folder-close {
        display: none;
      }
    }
    &:not(.open) {
      .icon-open,
      .folder-open {
        display: none;
      }
    }
  }
  &:not(.has-children) {
    .icon-caret,
    .folder-icon {
      display: none;
    }
  }

  .entry-element:not(:first-of-type) {
    margin-left: 10px;
  }

  .entry-element {
    &.caret {
      flex: 0 0 20px;
      font-size: 16px;
      color: #546e7a;
      cursor: pointer;
    }
    &.check {
      color: #607d8b;
      font-size: 17px;
    }
    &.icon-folder {
      color: #fbc02d;
      font-size: 19px;
    }
  }

  &.selected {
    .entry-element {
      &.check {
        color: #26a69a;
      }
    }
  }

  &.disabled {
    opacity: 0.3;
  }
}

.children-container {
  overflow: hidden;
  // transition: height 120ms ease;
}

[draggable] {
  user-select: none;
}
.drop-effect {
  background-color: red;
}
</style>
