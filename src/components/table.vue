<template>
  <div>
    <v-card flat>
      <v-card-text>
        <v-container fluid>
          <v-row>
            <v-col cols="12" sm="4" md="4">
              <v-checkbox
                v-model="lvFlag"
                :label="`LV1ステータス: ${lvFlag.toString()}`"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" sm="4" md="4">
              <v-checkbox
                v-model="skilllvFlag"
                :label="`LV1スキル: ${skilllvFlag.toString()}`"
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>

    <v-data-table
      :headers="headers"
      :items="itemData"
      :items-per-page="25"
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
      <template v-slot:[`item.Hp`]="{ item }">
        <span v-html="getParam(item.Hp, item)"></span>
      </template>
      <template v-slot:[`item.Atk`]="{ item }">
        <span v-html="getParam(item.Atk, item)"></span>
      </template>
      <template v-slot:[`item.Def`]="{ item }">
        <span v-html="getParam(item.Def, item)"></span>
      </template>
      <template v-slot:[`item.Sp`]="{ item }">
        <span v-html="getParam(item.Sp, item)"></span>
      </template>
      <template v-slot:[`item.Spd`]="{ item }">
        <span v-html="getParam(item.Spd, item)"></span>
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
        <a :href="item.url + '&&referrer=reformplay'" target="_blank">Link</a>
      </template>
    </v-data-table>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        lvFlag:false,
        skilllvFlag:false,
        pagination: {
          sortBy: 'id'
        },
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
            text: 'Link',
            align:'center',
            value: 'url'
          },
        ],
        filters:{
          'Rarity':[],
          Element:[],
          Kind:[]

        },
        activeFilters: {},
        itemData:[],

      }
    },
    created:function(){
      this.itemData = require("../assets/output.json");
    },
    watch:{
      itemData(){
        this.initFilters();
      }
    },
    methods:{
      getElementColor(element){
        if(element === "青") return 'blue'
        else if(element === '赤') return 'red'
        else if(element === '緑') return 'green'
      },
      getParam(num, item){
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
        if(this.lvFlag){
          return Math.round(num/item.totalScore * itemRareScore);
        }
        else{
          return num;
        }
      },
      getSkill(skill){
        if(this.skilllvFlag){
          const val = Math.round(skill.Value / ((skill.Level-1)*0.1+1));
          return skill.Name + "(Lv1):"+val;
        }else{
          return skill.Name + "(Lv"+skill.Level+"):"+skill.Value;
        }
      },
      initFilters() {
      for (const col in this.filters) {
        console.log(col);
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
    }
  }
</script>
