import axios from "axios";

const API = axios.create({
  baseURL: "https://my-monitor-d5yl.onrender.com/api"
});

export default API;