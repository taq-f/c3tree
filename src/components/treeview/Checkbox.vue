<template>
<span :class="state">
  <i class="icon fas fa-check-square checked"></i>
  <i class="icon far fa-minus-square intermediate"></i>
  <i class="icon far fa-square none"></i>
</span>
</template>

<script>
export default {
  name: 'checkbox',
  props: {
    state: String,
  },
}
</script>

<style lang="scss" scoped>
.icon {
  display: none;
}
span {
  &.checked {
    .checked {
      display: inherit;
    }
  }
  &.intermediate {
    .intermediate {
      display: inherit;
    }
  }
  &.none {
    .none {
      display: inherit;
    }
  }
}
</style>
