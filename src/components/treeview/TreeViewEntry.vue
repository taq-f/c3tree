<template>
  <div>
    <!-- An Entry -->
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

    <!-- Child Entries (List of this component recursively) -->
    <!--   This child container is always visible for height transition -->
    <div class="children-container" :style="childrenContainerStyle">
      <transition-group name="expand" @before-enter="beforeChildrenEnter" @before-leave="beforeChildrenLeave">
        <tree-view-entry
          v-if="entry.open"
          ref="children"
          v-for="child of entry.children"
          :key="child.id"
          :height="height"
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
      </transition-group>
    </div>
  </div>
</template>

<script>
import Checkbox from '@/components/treeview/Checkbox.vue'

export default {
  components: {
    Checkbox,
  },
  name: 'tree-view-entry',
  props: {
    entry: Object,
    height: Number,
    level: Number,
    noIcon: Boolean,
    noCheckIcon: Boolean,
    draggable: Boolean,
    dragProp: Object,
    entryStateChange: Function,
  },
  data() {
    return {
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
    /**
     * Calculate and set child container's height
     *
     * When this entry is closed state, child height is just 0. When open,
     * there need a little calculation.
     */
    setChildHeight() {
      let childHeight = 0
      if (this.entry.open) {
        if (this.$refs.children) {
          for (const child of this.$refs.children) {
            if (child.entry.children) {
              // folder has its children and its own height
              childHeight += child.childHeight + child.height
            } else {
              // leaf do not have children, so it takes only its own height.
              childHeight += child.height
            }
          }
        }
      }
      this.childHeight = childHeight
      this.$emit('open-change')
    },
    /**
     * Handler for child open state change
     *
     * Child container height must be reevaluated when a child entry is
     * opened or closed. And parent should know it too (emitting event).
     */
    handleChildOpenChange() {
      this.setChildHeight()
      this.$emit('open-change')
    },
    /**
     * Handler for child entries is rendered
     *
     * Adjusting child height should be triggered by open state change. But
     * $refs.children is empty when "entry.open" becomes true since they are not
     * mounted yet. Which means child height cannot be retrieved by watching
     * "entry.open".
     *
     * So prepare a transition for child entries and use the events for
     * trigering child height calculation. $refs.children exists when
     * "before-enter" fires.
     */
    beforeChildrenEnter() {
      this.setChildHeight()
    },
    /**
     * Handler for child entries is removed from DOM
     *
     * Same here as "before-enter"; watching "entry.open = false" cannot
     * have empty children state. "before-leave" might be the firstest
     * timing when $refs.children becomes empty.
     */
    beforeChildrenLeave() {
      this.setChildHeight()
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
      this.setChildHeight()
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
  transition: height 200ms ease;
}

[draggable] {
  user-select: none;
}
.drop-effect {
  background-color: red;
}

.expand-leave-active {
  transition: opacity 0.5s;
}
.expand-leave-to {
  opacity: 0;
}
</style>