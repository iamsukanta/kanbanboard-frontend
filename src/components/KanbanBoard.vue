<template>
  <div class="root-container">
    <Loading 
      :active.sync="isLoading"
      :is-full-page="true">
    </Loading>
    <div class="root-container__header">
      <h1>Kanban Board</h1>
    </div>

    <!-- Filter section goes heres -->
    <div class="root-container__filter-section">
      <div class="root-container__filter-section__status">
        <label for="columnStatus">
          Select Status
        </label>
        <select v-model="filter.status" @change="getColumns()" id="columnStatus" class="root-container__filter-section__status__form">
          <option value="1">Active</option>
          <option value="0">Delete</option>
          <option value="">All</option>
        </select>
      </div>
      <div class="root-container__filter-section__date">
        <label for="columnStatus">
          Select Date
        </label>
        <div class="root-container__filter-section__date__form">
          <input type="date" class="root-container__filter-section__date__form__input" @change="filterColumnsByDate()" v-model="filter.date" />
          <button type="button" @click="clearDate()" class="root-container__filter-section__date__form__input__clear-button">
            Clear Date
          </button>
        </div>
      </div>
    </div>

    <div class="root-container__kanban-board">
      <div class="column-item" v-for="(column,colIndex) in columns" :key="colIndex+column.id">
        <div class="column-item__header">
          <div class="column-item__header__title">
            <p>{{ column.title }}</p>
          </div>
          <button type="button" @click="deleteColumn(column.id)" class="column-item__header__delete__button">
            &times;
          </button>
        </div>

        <draggable
          class="card-drag"
          v-model="column.cards"
          v-bind="cardDragOptions"
          @end="handleCardMoved"
        >
          <transition-group
            class="task-drag-transition"
            tag="div"
          >
            <div class="column-item__card_item"  @click="viewCardModal(cardItem, column.id)" v-for="(cardItem, cardIndex) in column.cards" :key="cardIndex+cardItem.position">
              <div class="column-item__card_item___title">
                <p>{{ cardItem.title }}</p>
              </div>
            </div>
          </transition-group>
        </draggable>

        <div class="add-card">
          <button type="button" @click="openCardModal(column.id)" class="add-card__button">
            + Add Card
          </button>
        </div>
      </div>
      <div class="add-column">
        <button type="button" @click="openAddColumnModal()" class="add-column__button">
          + Add Column
        </button>
      </div>
    </div>

    <div class="export-section">
      <button type="button" @click="exportSql()" class="export-section__button">
        Export SQL
      </button>
    </div>
  </div>
</template>

<script>
  import Loading from 'vue-loading-overlay';
  import 'vue-loading-overlay/dist/vue-loading.css';
  import axios from 'axios';
  import draggable from 'vuedraggable';
  import AddColumnModal from './modal/AddColumn.vue';
  import AddEditCardModal from './modal/AddEditCard.vue';

  export default {
    components: {
      draggable,
      Loading
    },
    computed: {
      cardDragOptions() {
        return {
          animation: 200,
          group: "card-list",
          dragClass: "column-drag"
        };
      }
    },
    data() {
      return {
        columns: [],
        isLoading: false,
        modalOptions: {
          draggable: true,
          width: 500,
          height: 'auto',
          adaptive: true
        },
        filter: {
          status: 1,
          date: ''
        }
      }
    },
    mounted() {
      this.getColumns();
    },
    methods: {
      async getColumns() {
        this.isLoading = true;
        axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/columns?access_token=${process.env.VUE_APP_ACCESS_TOKEN}&status=${this.filter.status}&date=${this.filter.date}`
        )
        .then((res) => {
          this.columns = res.data.data;
        })
        .catch((error) => {
          this.isLoading = false;
          alert('Something went wrong from api: ' + error?.message);
        })
        .finally(() => {
          this.isLoading = false;
        });
      },

      clearDate() {
        if(this.filter.date) {
          this.filter.date = '';
          this.getColumns();
        }
      },

      filterColumnsByDate() {
        const currentParams = { ...this.$route.query };
        currentParams.date = this.filter.date;
        currentParams.state = this.filter.status;
        this.$router.push({ 
          path: this.$route.path,
          query: currentParams,
        });
      },


      openAddColumnModal() {
        this.$modal.show(
          AddColumnModal,
          {
            update: this.addNewColumn
          },
          {
            name: "addColumnModal",
            ...this.modalOptions
          },
        );
      },

      openCardModal(columnId) {
        this.$modal.show(
          AddEditCardModal,
          {
            columnId: columnId,
            cardData: {},
            update: this.addNewCard
          },
          {
            name: "addEditCardModal",
            ...this.modalOptions
          },
        );
      },

      viewCardModal(card, columnId) {
        this.$modal.show(
          AddEditCardModal,
          {
            columnId: columnId,
            cardData: card,
            update: this.addNewCard
          },
          {
            name: "addEditCardModal",
            ...this.modalOptions
          },
        );
      },

      addNewColumn(responseData) {
        this.columns.push({ ...responseData, cards: []});
      },

      deleteColumn(columnId) {
        this.isLoading = true;
        axios.delete(
          `${process.env.VUE_APP_API_BASE_URL}/columns/${columnId}?access_token=${process.env.VUE_APP_ACCESS_TOKEN}`
        )
        .then(() => {
          let index = this.columns.findIndex(x => x.id === columnId);
          this.columns.splice(index, 1);
        })
        .catch((error) => {
          this.isLoading = false;
          alert('Something went wrong when deleting:' + error?.message);
        })
        .finally(() => {
          this.isLoading = false;
        });
      },

      addNewCard(card_data, columnId, actionType) {
        let columnIndex = this.columns.findIndex(x => x.id === columnId);
        if(actionType == 'edit') {
          let cardIndex = this.columns[columnIndex].cards.findIndex(x => x.id == card_data.id);
          this.columns[columnIndex].cards.splice(cardIndex, 1, card_data);
        } else {
          this.columns[columnIndex].cards.push(card_data);
        }
      },

      handleCardMoved() {
        axios.put(
          `${process.env.VUE_APP_API_BASE_URL}/columns/rearrange?access_token=${process.env.VUE_APP_ACCESS_TOKEN}`, {columns: this.columns}
        )
        .then(() => {
        })
        .catch((error) => {
          alert('Something went wrong from api: ' + error?.message);
        })
        .finally(() => {
        });  
      },

      exportSql() {
        this.isLoading = true;
        axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/export/db?access_token=${process.env.VUE_APP_ACCESS_TOKEN}`
        )
        .then((res) => {
          return this.generateSqlFile(res.data);
        })
        .catch((error) => {
          this.isLoading = false;
          alert('Something went wrong from api: ' + error?.message);
        })
        .finally(() => {
          this.isLoading = false;
        });  
      },

      generateSqlFile(sqlContent) {
        let fileNo = Math.floor(Math.random() * 1001);
        const blob = new Blob([sqlContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `data_${fileNo}.sql`;
        link.click();
      }
    }
  }
</script>