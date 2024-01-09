<template>
  <div id="app">
    <KanbanBoard msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import KanbanBoard from './components/KanbanBoard.vue'

export default {
  name: 'App',
  components: {
    KanbanBoard
  }
}
</script>

<style>
</style>
