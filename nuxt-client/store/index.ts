export const actions = {
  async nuxtServerInit({ commit }, { req, res }) {
    let auth = null;

    if (this.$cookies.get("sessionid") !== undefined) {
      auth = this.$cookies.get("sessionid");
    }

    commit("users/setAuth", auth);
  }
};
