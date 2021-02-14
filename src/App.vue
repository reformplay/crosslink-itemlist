<template>
  <v-app>
    <v-main>
      <Table/>
    </v-main>
  </v-app>
</template>

<script>
import Table from './components/table';

export default {
  name: 'App',

  components: {
    Table,
  },

  data: () => ({
    //
  }),
};
</script>
