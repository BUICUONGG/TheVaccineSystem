import axios from "axios";

// tao ra cong config de ket noi voi api
const api = axios.create({
    baseURL: 'http://localhost:8080/user'
  });

  export default api;