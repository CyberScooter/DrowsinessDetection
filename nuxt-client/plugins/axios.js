import Cookie from "js-cookie";

export default function({ $axios, redirect, store }) {
  $axios.interceptors.request.use(config => {
    if(store.state.users.auth != null) config.headers["authorization"] = `Bearer ${store.state.users.auth}`;
    if (store.state.users.csrfToken != null) config.headers.common['x-csrf-token'] = store.state.users.csrfToken
    
    return config;
  });
}
