<template>
<div>
  
  <v-card flat>
    <v-container
        class="px-0"
        fluid
      >
      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-checkbox
            v-model="lvFlag"
            :label="`LV1ステータス: ${lvFlag.toString()}`"
            hide-details
          ></v-checkbox>
          <v-checkbox
            v-model="skilllvFlag"
            :label="`LV1スキル: ${skilllvFlag.toString()}`"
            hide-details
          ></v-checkbox>
        </v-col>
        <v-col cols="12" sm="4" md="4">

          <v-checkbox
            v-model="lvFlag"
            :label="`LV1ステータス: ${lvFlag.toString()}`"
            hide-details
          ></v-checkbox>
          <v-checkbox
            v-model="skilllvFlag"
            :label="`LV1スキル: ${skilllvFlag.toString()}`"
            hide-details
          ></v-checkbox>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
    <v-card-title>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
<v-data-table
    :headers="headers"
    :items="itemData"
    item-key="name"
    :items-per-page="25"
    :search="search"
    class="elevation-1"
  >
    <template v-slot:item.Element="{item}">
      <v-chip :color="getElementColor(item.Element)" dark>{{item.Element}}</v-chip>
    </template>
    <template v-slot:item.Level="{item}">
      <span v-html="lvFlag&&item.Level>1?'(1)':item.Level"></span>
    </template>
    <template v-slot:item.Hp="{item}">
      <span v-html="getParam(item.Hp,item)"></span>
    </template>
    <template v-slot:item.Atk="{item}">
      <span v-html="getParam(item.Atk,item)"></span>
    </template>
    <template v-slot:item.Def="{item}">
      <span v-html="getParam(item.Def,item)"></span>
    </template>
    <template v-slot:item.Sp="{item}">
      <span v-html="getParam(item.Sp,item)"></span>
    </template>
    <template v-slot:item.Spd="{item}">
      <span v-html="getParam(item.Spd,item)"></span>
    </template>
    <template v-slot:item.Skills="{item}">
      <span class="d-block" v-for="(skill,index) in item.Skills" :key="index" v-html="getSkill(skill)"></span>
    </template>
    <template v-slot:item.url="{item}">
      <a :href="item.url+'&&referrer=reformplay'" target="_blank">Link</a>
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
        search:'',
        headers: [
          {
            text: 'アイテム名',
            align: 'start',
            value: 'itemName',
          },
          { 
            text: 'レアリティ',
            align:'center',
            value: 'Rarity'
          },
          { 
            text: 'Element',
            align:'center',
            value: 'Element'
          },
          { 
            text: '部位',
            align:'center',
            value: 'Kind'
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
       itemData:[],
      }
    },
    created:function(){
      this.itemData = require("../assets/output.json");

    },
    methods:{
      getElementColor(element){
        if(element === "青") return 'blue'
        else if(element === '赤') return 'red'
        else if(element === '緑') return 'green'
      },
      lvdata(){
        console.log('click')
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
      }
    }
  }
</script>