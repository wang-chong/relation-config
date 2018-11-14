<template>
  <div id="firstApp">
    <!-- <router-view/> -->
    <First/>
  </div>
</template>

<script>
import First from '@/view/first/components/First'

export default {
  name: 'firstApp',
  components: {
    First
  }
}
</script>

<style>
#firstApp {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #2c3e50;
  margin-top: 60px;
  box-sizing: border-box;
}
</style>
