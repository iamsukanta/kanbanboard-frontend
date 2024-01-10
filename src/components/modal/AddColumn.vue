<template>
  <div class="modal-content">
    <Loading 
      :active.sync="isLoading"
      :is-full-page="true">
    </Loading>
    <p class="modal-content__title">Create New Column</p>
    <hr/>
    <form class="modal-content__form" @submit.prevent="handleAddNewColumn">
      <div class="input-group">
        <label for="title">
          Column Title <span>*</span>
        </label>
        <input class="input-group__input" type="text" id="title" placeholder="Title" v-model="newColumn.title" @input="handleChange">
        <div v-show="errorMessage">
          <span class="input-group__text-error">
            {{ errorMessage }}
          </span>
        </div>
      </div>
      <div class="modal-button-group">
        <button type="reset" class="modal-button-group__close-button" @click="$emit('close')">
          Cancel
        </button>
        <button type="submit" class="modal-button-group__submit-button">
          + Add Column
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import axios from 'axios';
export default {
  props: {
    text: String,
  },
  components: {
    Loading
  },
  data() {
    return {
      newColumn: {
        title: "",
      },
      errorMessage: "",
      isLoading: false
    };
  },
  methods: {
    handleAddNewColumn() {
      if (!this.newColumn.title) {
        this.errorMessage = "The title field is required";
        return;
      } else {
        this.errorMessage = "";
      }

      this.isLoading = true;
      axios.post(
        `${process.env.VUE_APP_API_BASE_URL}/columns?access_token=${process.env.VUE_APP_ACCESS_TOKEN}`, { title: this.newColumn.title }
      )
      .then((res) => {
        this.$attrs.update(res.data.data);
        this.$emit("close");
      })
      .catch((error) => {
        this.isLoading = false;
        alert('Something went wrong from api: ' + error?.message);
      })
      .finally(() => {
        this.isLoading = false;
      });
    },
    handleChange() {
      if (!this.newColumn.title) {
        this.errorMessage = "The title field is required";
      } else {
        this.errorMessage = "";
      }
    }
  }
};
</script>