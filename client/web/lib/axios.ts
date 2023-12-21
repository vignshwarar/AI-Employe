import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const axiosClientWithAuth = (() => {
  const getAuthToken = async () => {
    try {
      const token = await new Promise((resolve, reject) => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
          if (user) {
            user.getIdToken().then((token) => {
              resolve(token);
            });
          } else {
            reject("No auth token");
          }
        });
      });
      return "Bearer " + token;
    } catch (err) {
      console.log(err);
      return "";
    }
  };

  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_HOST,
  });

  instance.interceptors.request.use(async (config) => {
    config.headers.Authorization = await getAuthToken();
    return config;
  });

  return instance;
})();

export const axiosClientNoAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HOST,
});
