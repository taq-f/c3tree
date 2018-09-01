<template>
<span :class="state">
  <font-awesome-icon v-if="state === 'checked'" icon="check-square" />
  <font-awesome-icon v-else-if="state === 'none'" :icon="['far', 'square']" />
  <font-awesome-icon v-else icon="minus-square" />
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
