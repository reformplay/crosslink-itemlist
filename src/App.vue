<template>
  <v-app>
    <v-main>
      <Table/>
    </v-main>
    <Footer/>
  </v-app>
</template>

<script>
import Table from './components/table';
import Footer from './components/footer';
export default {
  name: 'App',

  components: {
    Table,
    Footer
  },

  data: () => ({
    //
  }),
};
</script>
