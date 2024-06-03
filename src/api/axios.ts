import axios, { AxiosError } from "axios";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";

const baseHostName = "http://localhost:7002"; //"https://prior-express.onrender.com";

const axiosInstance = axios.create({
  baseURL: baseHostName,
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await localStorage.getItem("token");
    if (config.headers) config.headers.set("x-access-token", token);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error instanceof AxiosError && error.response?.status === 403) {
      useLoginAuth().signOut();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
