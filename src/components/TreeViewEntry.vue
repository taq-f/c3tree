<template>
  <div class="wrapper">
    <div class="entry"
      :class="entryCssClass"
      :style="entryStyle"
      @click="handleClick(entry)"
      draggable="true"
      @dragstart="dragStart(entry, $event)"
      @dragover="dragOver(entry, $event)"
      @dragenter="dragEnter(entry, $event)"
      @dragleave="dragLeave(entry, $event)"
      @drop="drop(entry, $event)"
      @dragend="dragEnd(entry, $event)"
      >
      <div class="background"></div>
      <div class="entry-items">
        <div v-if="entry.children" class="entry-item caret" @click.stop="toggleState(entry, $event)">
          <i class="icon-caret icon-close fas fa-fw fa-caret-right"></i>
          <i class="icon-caret icon-open fas fa-fw fa-caret-down"></i>
        </div>
        <div class="entry-item check">
          <checkbox :state="entry.state"></checkbox>
        </div>
        <div v-if="entry.children" class="entry-item folder-icon">
          <i class="fas fa-folder"></i>
        </div>
        <div class="entry-item">
          {{ entry.text }}
        </div>
      </div>
    </div>

    <height-expand-transition>
      <div class="children-container" v-if="entry.open">
        <tree-view-entry
          ref="childNodes"
          v-for="child of entry.children"
          :key="child.id"
          :entry="child"
          :drag-prop="dragProp"
          @select-entry="handleSelect"
          @drag-end="childDragEnd"
        ></tree-view-entry>
      </div>
    </height-expand-transition>
  </div>
</template>

<script>
import Checkbox from '@/components/Checkbox.vue'
import HeightExpandTransition from '@/components/HeightExpandTransition.vue'

export default {
  components: {
    Checkbox,
    HeightExpandTransition,
  },
  name: 'tree-view-entry',
  props: {
    entry: Object,
    dragProp: Object,
  },
  data() {
    return {
      dropEffect: false,
    }
  },
  computed: {
    entryStyle() {
      return {paddingLeft: `${this.entry.level * 20}px`}
    },
    entryCssClass() {
      return {
        open: this.entry.open,
        'has-children': this.entry.children,
        selected: this.entry.state === 'checked',
        'drop-effect': this.dropEffect,
      }
    },
  },
  methods: {
    toggleState(entry, event) {
      entry.open = !entry.open
    },
    handleClick(entry) {
      let toState      
      switch (entry.state) {
        case 'none':
          toState = 'checked'
          break;
        case 'intermediate':
          toState = 'checked'
          break;
        case 'checked':
          toState = 'none'
          break;
        default:
          // TODO error
          break;
      }

      this.setState(entry, toState)

      this.$emit('select-entry', entry)
    },
    handleSelect(entry) {
      // when check state of a child component changed,
      // check to see if all/some/none of them are selected and
      // change this own state depending on them.
      const states = new Set(this.$refs.childNodes.map(c => c.entry.state))
      if (states.size > 1) {
        this.entry.state = 'intermediate'
      } else {
        this.entry.state = this.$refs.childNodes[0].entry.state
      }

      // pass it to parent
      this.$emit('select-entry', entry)
    },
    setState(entry, state) {
      entry.state = state
      if (entry.children) {
        for (const child of entry.children) {
          this.setState(child, state)
        }
      }
    },
    dragStart(entry, event) {
      console.log('dragstart', entry.text, this.dragProp)
      this.dragProp.entry = entry
    },
    dragOver(entry, event) {
      event.preventDefault()
      // console.log('dragover')
      event.dataTransfer.dropEffect = 'move'
      return false
    },
    dragEnter(entry, event) {
      console.log('dragenter', entry.text)
      this.dropEffect = true
    },
    dragLeave(entry, event) {
      console.log('dragleave', entry.text)
      this.dropEffect = false
      return false
    },
    drop(entry, event) {
      event.preventDefault()
      console.log('drop', entry.text, this.dragProp.entry.text)
      entry.children = [...entry.children, this.dragProp.entry]
    },
    dragEnd(entry, event) {
      console.log('dragEnd', entry.text)
      this.$emit('drag-end', entry)
    },
    childDragEnd(entry) {
      console.log('childDragEnd', entry.text)
      this.entry.children = this.entry.children.some(c => {
        return c.id === entry.id
      })
    }
  },
  mounted() {
    this.$on('parent-state-changed', state => {
      this.setState(this.entry, state)
    })
  }
}
</script>

<style lang="scss" scoped>
.entry {
  height: 28px;
  display: flex;
  align-items: center;
  position: relative;

  &.has-children {
    &.open {
      .icon-close {
        display: none;
      }
    }
    &:not(.open) {
      .icon-open {
        display: none;
      }
    }
  }
  &:not(.has-children) {
    .icon-caret {
      display: none;
    }
  }

  .entry-items {
    display: flex;
    align-items: center;

    .entry-item:not(:first-of-type) {
      margin-left: 10px;
    }

    .entry-item {
      position: relative;
    }

    .check {
      color: #90a4ae;
    }
  }

  .background {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    pointer-events: none;
    opacity: 0.2;
    transition: background-color 100ms ease;
  }
  &:hover {
    .background {
      background-color: #78909c;
    }
  }
  &.selected {
    .background {
      background-color: #546e7a;
    }
  }
}
.caret {
  cursor: pointer;
}
.folder-icon {
  color: #009688;
}

[draggable] {
  user-select: none;
}
.drop-effect {
  background-color: red;
}
</style>

