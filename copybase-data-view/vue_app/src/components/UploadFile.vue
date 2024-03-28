<template>
  <div class="container">
    <div class="drop">
      <input type="file" id="files" ref="files" @change="handleFilesUpload()"/>
      <button @click="submitFiles()">Submit</button>
    </div>
    <div class="chartContainer">
      <div class="mrrChart">
        <h1 v-if="data.datasets[0].data.length > 0">2022</h1>
        <Bar v-if="data.datasets[0].data.length > 0" :data="data" ref="chart" :key="reloadCharts" />
      </div>
      <div class="churnChart">
        <h1 v-if="mrrData.datasets[0].data.length > 0">2022</h1>
        <Bar v-if="mrrData.datasets[0].data.length > 0" :data="mrrData" ref="chart" :key="reloadCharts" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'

// Register imported ChartJS attributes
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Todo: Move API url to ENV
const apiUrl = 'http://localhost:3000'

export default {
  name: 'UploadFile',
  components: {
    Bar,
  },
  data() {
    return {
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
        datasets: [{ data: [] }]
      },
      mrrData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
        datasets: [{ data: [] }]
      },
      options: {
        responsive: true
      },
      files: [],
      reloadCharts: true,
    }
  },
  methods: {
    /*
      Function SubmitFiles()
         - posts 'file' to apiUrl
         - formats response dataset
         - reloads charts to display dataset
    */
    async submitFiles(){
      /**
       * Create FormData with file and posts with Axios
       */
      let formData = new FormData();
      formData.append('file', this.files[0]);
      await axios.post( apiUrl,
        formData,
        {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
        }
      ).then((res) => {
        /**
         * Create DataSets for Churn Rate
         *  Churn Rate is determined using the number of
         * active and canceled users for the month
         */
        let formatDataSet = [
          {label: 'Active users', backgroundColor: '#0000ff',data: []},
          {label: 'Cancelled users', backgroundColor: '#ff0000',data: []}]
        Object.keys(res.data.data.mrr.users).forEach((key) => {
          formatDataSet[0].data.push(res.data.data.mrr.users[key])
        })
        Object.keys(res.data.data.mrr.datasets).forEach((key) => {
          formatDataSet[1].data.push(res.data.data.mrr.datasets[key].canceled)
        })
        this.mrrData.datasets = formatDataSet
        /**
         * Create DataSet for MRR
         *  MRR is determined by the revenue earned
         * by active users, the total earnings of the month
         */
        formatDataSet = [{label: 'Monthly Recurring Revenue', backgroundColor: '#008000', data: []}]
        Object.keys(res.data.data.mrr.datasets).forEach((key) => {
          formatDataSet[0].data.push(res.data.data.mrr.datasets[key].valor)
        })
        this.data.datasets = formatDataSet
        this.reloadCharts = !this.reloadCharts
      })
      .catch((err) => {
        console.log('FAILURE!!', err);
      });
    },
    /*
      Function SubmitFiles()
         - adds uploaded file to this.files
    */
    handleFilesUpload(){
      let uploadedFile = this.$refs.files.files;
      /*
        Adds the uploaded file to the files array
      */
      this.files[0] = uploadedFile;
    },
  },
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.mrrChart, .churnChart {
  min-width: 600px;
}
.drop {
  padding: 30px;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
