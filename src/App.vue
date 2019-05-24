<template>
  <div id="app">
    <SlidesContainer />
  </div>
</template>

<script>
import SlidesContainer from './components/Slides Container'
import Reveal from 'reveal.js/js/reveal'

export default {
  name: 'app',
  components: {
    SlidesContainer
  },
  mounted () {
    Reveal.initialize()
  }
}
</script>

<style>
@import url('../node_modules/reveal.js/css/reveal.css');
@import url('../node_modules/reveal.js/css/theme/black.css');
@import url('../node_modules/reveal.js/lib/css/zenburn.css');

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
  height: 100vh;
}
</style>
