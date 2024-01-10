<template>
  <div class="modal-content">
    <Loading 
      :active.sync="isLoading"
      :is-full-page="true">
    </Loading>
    <p class="modal-content__title">Edit Card</p>
    <hr />
    <form class="modal-content__form" @submit.prevent="handleCard">
      <div class="input-group">
        <label for="title">
          Card Title <span>*</span>
        </label>
        <input class="input-title" type="text" id="title" placeholder="Card Title" v-model="card.title" @input="handleChange('title')" />
        <div v-show="errorMessage.title">
          <span class="input-group__text-error">
            {{ errorMessage.title }}
          </span>
        </div>
      </div>

      <div class="input-group">
        <label for="description">
          Card Description <span>*</span>
        </label>
        <textarea class="input-title" type="text" id="description" rows="6" placeholder="Card Description" v-model="card.description" @input="handleChange('description')"></textarea>
        <div v-show="errorMessage.description">
          <span class="input-group__text-error">
            {{ errorMessage.description }}
          </span>
        </div>
      </div>

      <div class="modal-button-group">
        <button type="reset" class="modal-button-group__close-button" @click="$emit('close')">
          Cancel
        </button>
        <button type="submit" class="modal-button-group__submit-button">
          Edit Card
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
    columnId: Number,
    cardData: {},
  },
  components: {
    Loading
  },
  data() {
    return {
      card: {...this.cardData },
      errorMessage: {
        title: "",
        description: ""
      },
      isLoading: false
    };
  },
  methods: {
    handleCard() {
      if(!this.card.title && !this.card.description) {
        this.errorMessage.title = "The title field is required";
        this.errorMessage.description = "The description field is required";
        return;
      } else if (!this.card.title) {
        this.errorMessage.title = "The title field is required";
        return;
      } else if(!this.card.description) {
        this.errorMessage.description = "The description field is required";
        return;
      } else {
        this.errorMessage.title = "";
        this.errorMessage.description = "";
      }

      this.isLoading = true;
      axios.put(
        `${process.env.VUE_APP_API_BASE_URL}/columns/${this.columnId}/cards/${this.card.id}?access_token=${process.env.VUE_APP_ACCESS_TOKEN}`, this.card
      )
      .then((res) => {
        this.$attrs.update(res.data.data, this.columnId, 'edit');
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

    handleChange(value) {
      if(value == 'title') {
        if (!this.card.title) {
          this.errorMessage.title = "The title field is required";
        } else {
          this.errorMessage.title = "";
        }
      } else {
        if (!this.card.description) {
          this.errorMessage.description = "The description field is required";
        } else {
          this.errorMessage.description = "";
        }
      }
    }
  }
};
</script>