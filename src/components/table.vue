<template>
  <div>
    <v-card flat>
      <v-card-text>
        <v-container fluid>
          <p>
            データについては、タイムラグがあります。場合によっては売り切れ、売却期限終了となっている場合もあります。
          </p>
          <p>アイテムデータ更新日時 : {{ lastUpdate }}</p>
          <hr />
          <v-row>
            <v-col cols="12" sm="4" md="4">
              <v-checkbox
                v-model="lvFlag"
                :label="`LV1ステータス: ${lvFlag.toString()}`"
                @change="changeParam"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" sm="4" md="4">
              <v-checkbox
                v-model="skilllvFlag"
                :label="`LV1スキル: ${skilllvFlag.toString()}`"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" sm="4" md="4">
              <v-text-field
                append-icon="mdi-magnify"
                label="スキル検索"
                single-line
                hide-details
                v-model="skillsearch"
                @input="filterSearch"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>

    <v-data-table
      :headers="headers"
      :options.sync="options"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      @update:options="handleOptionsUpdate"
      :items="filterItemData"
      mobile-breakpoint="0"
      :footer-props="{
        'items-per-page-options': [10, 20, 50, 100, 200, 300, 400, 500],
        showFirstLastPage: true,
      }"
      class="elevation-1"
    >
      <template v-for="(col, i) in filters" v-slot:[`header.${i}`]="{ header }">
        <div style="display: inline-block; padding: 16px 0" v-bind:key="i">
          {{ header.text }}
        </div>
        <div style="float: right; margin-top: 8px" v-bind:key="i">
          <v-menu
            :close-on-content-click="false"
            :nudge-width="200"
            offset-y
            transition="slide-y-transition"
            left
            fixed
            style="position: absolute; right: 0"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="indigo" icon v-bind="attrs" v-on="on">
                <v-icon
                  small
                  :color="
                    activeFilters[header.value] &&
                    activeFilters[header.value].length <
                      filters[header.value].length
                      ? 'red'
                      : 'default'
                  "
                >
                  mdi-filter-variant
                </v-icon>
              </v-btn>
            </template>
            <v-list flat dense class="pa-0">
              <v-list-item-group
                multiple
                v-model="activeFilters[header.value]"
                class="py-2"
              >
                <template v-for="item in filters[header.value]">
                  <v-list-item :key="`${item}`" :value="item" :ripple="false">
                    <template v-slot:default="{ active, toggle }">
                      <v-list-item-action>
                        <v-checkbox
                          :input-value="active"
                          :true-value="item"
                          @click="toggle"
                          color="primary"
                          :ripple="false"
                          dense
                        ></v-checkbox>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title v-text="item"></v-list-item-title>
                      </v-list-item-content>
                    </template>
                  </v-list-item>
                </template>
              </v-list-item-group>
              <v-divider></v-divider>
              <v-row no-gutters>
                <v-col cols="6">
                  <v-btn
                    text
                    block
                    @click="toggleAll(header.value)"
                    color="success"
                    >Toggle all</v-btn
                  >
                </v-col>
                <v-col cols="6">
                  <v-btn
                    text
                    block
                    @click="clearAll(header.value)"
                    color="warning"
                    >Clear all</v-btn
                  >
                </v-col>
              </v-row>
            </v-list>
          </v-menu>
        </div>
      </template>
      <template v-slot:[`item.Element`]="{ item }">
        <v-chip :color="getElementColor(item.Element)" dark>{{
          item.Element
        }}</v-chip>
      </template>
      <template v-slot:[`item.Level`]="{ item }">
        <span v-html="lvFlag && item.Level > 1 ? '(1)' : item.Level"></span>
      </template>
      <template v-slot:[`item.Skills`]="{ item }">
        <span
          class="d-block"
          v-for="(skill, index) in item.Skills"
          :key="index"
          v-html="getSkill(skill)"
        ></span>
      </template>
      <template v-slot:[`item.url`]="{ item }">
        <a :href="item.url + '&referrer=reformplay'" target="_blank">Link</a>
      </template>
    </v-data-table>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        lastUpdate:"",
        lvFlag:false,
        skilllvFlag:false,
        options: {
          page: 1,
          itemsPerPage: 20,

        },
        sortBy: ['id'],
        sortDesc: [true],
        headers: [
          {
            text: 'ID',
            align: 'start',
            value: 'id',
          },
          {
            text: 'アイテム名',
            align: 'start',
            value: 'itemName',
          },
          {
            text: 'レアリティ',
            align:'center',
            value: 'Rarity',
            filter: value => {
              return this.activeFilters.Rarity ? this.activeFilters.Rarity.includes(value) : true;
            }
          },
          {
            text: 'Element',
            align:'center',
            value: 'Element',
            filter: value => {
              return this.activeFilters.Element ? this.activeFilters.Element.includes(value) : true;
            }
          },
          {
            text: '部位',
            align:'center',
            value: 'Kind',
            filter: value => {
              return this.activeFilters.Kind ? this.activeFilters.Kind.includes(value) : true;
            }
          },
          {
            text: 'Level',
            align:'center',
            value: 'Level'
          },
          {
            text: 'Hp',
            align:'center',
            value: 'Hp'
          },
          {
            text: 'Atk',
            align:'center',
            value: 'Atk'
          },
          {
            text: 'Def',
            align:'center',
            value: 'Def'
          },
          {
            text: 'Sp',
            align:'center',
            value: 'Sp'
          },
          {
            text: 'Spd',
            align:'center',
            value: 'Spd'
          },
          {
            text: 'スキル',
            align:'start',
            value: 'Skills'
          },
          {
            text: 'IOST',
            align:'center',
            value: 'price'
          },
          {
            text: 'Link',
            align:'center',
            value: 'url'
          },
        ],
        filters:{
          'Rarity':[],
          'Element':[],
          'Kind':[],

        },
        activeFilters: {},
        skillsearch:"",
        itemData:[],
        parameta:{}

      }
    },
    created:function(){
      this.axios.get("./output.json").then(response => {
        this.lastUpdate = response.data.lastUpdate;
        this.itemData = response.data.itemData;
        this.itemData.map((d)=>{
          d.url = "https://www.tokenlink.io/market-item-detail.html?saleId="+d.id;
          d.Skills.map(s =>{
            if(s.Name === "ご当地アタックブースト"){
              var index   = s.Description.indexOf("周辺");
              var place = s.Description.substring(0, index);
              s.Name = s.Name.replace('ご当地','ご当地（'+place+')');
            }
          });
          this.parameta[d.id]={
            'Hp':d.Hp,
            'Atk':d.Atk,
            'Def':d.Def,
            'Sp':d.Sp,
            'Spd':d.Spd
          }
        });
      });
    },
    watch:{
      itemData(){
        this.initFilters();
      }
    },
    computed:{
      filterItemData(){
        if(this.skillsearch){
          console.log(this.skillsearch);

          return this.itemData.filter(d =>{
            const skillres = d.Skills.filter(s =>{
              return s.Name.indexOf(this.skillsearch)<0?false:true;
            });
            console.log(skillres);
            return skillres.length>0?d:false;
          });
        }else{
          return this.itemData;
        }

      }
    },
    methods:{
      getElementColor(element){
        if(element === "青") return 'blue'
        else if(element === '赤') return 'red'
        else if(element === '緑') return 'green'
      },
      getRareScore(item){
        const rare_score = {
          '1':50,
          '2':100,
          '3':150,
          '4':200,
          '5':250,
          '100':175,
        };
        let itemRareScore = rare_score[item.Rarity];
        if(item.Rarity == 4){
          if(!item.itemName.match(/ドラゴン/)){
            itemRareScore = item.Kind === '武器'?175:150;
          }
        }
        if(item.Rarity == 5){
          if(!item.itemName.match(/オーラ|アグニ/)){
            itemRareScore = item.Kind === '武器'?200:175;
          }
        }
        return itemRareScore;
      },
      changeParam(){
        this.itemData.map((d)=>{
          const itemRareScore = this.getRareScore(d);

          if(this.lvFlag){
            for(let val in this.parameta[d.id]){
              d[val] = Math.round(this.parameta[d.id][val]/d.totalScore * itemRareScore);
            }
          }else{
            for(let val in this.parameta[d.id]){
              d[val] = this.parameta[d.id][val];
            }
          }

        });
      },
      getSkill(skill){
        let s_name = skill.Name;
        if(this.skilllvFlag){
          var val;
          if(s_name === "クリティカルブースト"){
            val = parseFloat(skill.Value.replace('%',''));
            val = Math.round(val * 10 / ((skill.Level-1)*0.1+1)) / 10 + "%";
          }else{
            val = Math.round(skill.Value / ((skill.Level-1)*0.1+1));
          }
          return s_name + "(Lv1):"+val;
        }else{
          return s_name + "(Lv"+skill.Level+"):"+skill.Value;
        }
      },
      initFilters() {
      for (const col in this.filters) {
        //console.log(col);
        this.filters[col] = this.itemData.map((d) => { return d[col] }).filter(
          (value, index, self) => { return self.indexOf(value) === index }
        )
      }
      // TODO restore previous activeFilters before add/remove item
      this.activeFilters = Object.assign({}, this.filters)

      },

      toggleAll (col) {
        this.activeFilters[col] = this.itemData.map((d) => { return d[col] }).filter(
          (value, index, self) => { return self.indexOf(value) === index }
        )
      },

      clearAll (col) {
        this.activeFilters[col] = []
      },
      handleOptionsUpdate({sortBy, sortDesc}) {
        if (
          sortBy[0] === this.sortBy[0] &&
          sortDesc[0] === this.sortDesc[0]
        ) return

        if (sortBy[0] && sortDesc[0] === false) {
          this.sortDesc = [true]
          return
        }

        if (sortBy.length === 0 && sortDesc.length === 0) {
          this.sortBy = [this.sortBy[0]]
          this.sortDesc = [false]
          return
        }

        if (sortBy[0] && sortDesc[0] === true) {
          this.sortBy = []
          this.sortDesc = []
          return
        }
      },
      customSort(items, index, isDesc) {
        console.log(isDesc);
        items.sort((a, b) => {
          if (!isDesc) {
            return a[index] < b[index] ? -1 : 1;
          } else {
            return b[index] < a[index] ? -1 : 1;
          }
        });
        return items;
      },
      filterSearch(val) {
        this.filters = this.$MultiFilters.updateFilters(this.filters, {search: val});
      },
    }
  }
</script>
