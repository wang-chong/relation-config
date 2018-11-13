<template>
  <div>
    第一页的单独组件
    <p>来自vuex的state，name:{{userName}}</p>
  </div>
</template>

<script>
export default {
  computed: {
    userName () {
      return this.$store.state.name
    }
  }
}
</script>
