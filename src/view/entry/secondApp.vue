<template>
  <div id="secondApp">
    <router-view/>
    <Second/>
  </div>
</template>

<script>
import Second from '@/view/second/components/Second'

export default {
  name: 'SecondApp',
  components: {
    Second
  }
}
</script>

<style>
#secondApp {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
