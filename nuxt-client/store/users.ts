import { NuxtState } from "@nuxt/types/app";
import { Commit } from "vuex";
import { UserDTO, UserResponseDTO } from "~/utils/store//dtos/users.dto";
import { UserDetails } from "~/utils/store/entities/user.entity";
import Cookie from "js-cookie";

export const state = () => ({
  auth: null,
  user: {} as UserDetails,
  userData: {},
  csrfToken: {},
  error: ""
});

export const mutations = {
  setUserData(state: NuxtState, data: {}) {
    state.userData = data;
  },
  setUserDetails(state: NuxtState, user: UserDetails) {
    state.user = user;
  },
  setUserError(state: NuxtState, error: string) {
    state.error = error;
  },

  setAuth(state, auth: string) {
    state.auth = auth;
  },

  clearAuth(state) {
    state.auth = null;
  },

  setCSRFToken(state, csrfToken) {
    state.csrfToken = csrfToken;
  },

  setAccessToken(state, accessToken) {
    state.userData.accessToken = accessToken;
  }
};

export const actions = {
  async loginUser({ commit }, userToLogin: UserDTO) {
    let res = await this.$axios.$post(
      "/api/user/login",
      {
        username: userToLogin.username,
        password: userToLogin.password,
        _csrf: this.$cookies.get("XSRF-TOKEN")
      },
      { withCredentials: true }
    );

    if (!res.error) {
      commit("setUserDetails", res.user);
      return true;
    } else {
      commit("setUserError", res.error);
      return false;
    }
  },

  async registerUser({ commit }, userToRegister: UserDTO) {
    let res = await this.$axios.$post(
      "/api/user/register",
      {
        username: userToRegister.username,
        email: userToRegister.email,
        password: userToRegister.password,
        _csrf: this.$cookies.get("XSRF-TOKEN")
      },
      { withCredentials: true }
    );

    console.log(res);

    if (!res.error) {
      commit("setUserDetails", res.user);
      return true;
    } else {
      commit("setUserError", res.error);
      return false;
    }
  },

  async getAccessToken({ commit }, userID: string) {
    let res = await this.$axios.$get(
      `/api/user/${(userID as any).accessToken}/accessToken`
    );

    if (!res.error) {
      commit("setAccessToken", res.accessToken);
      return true;
    }
    return false;
  },

  async logoutUser() {
    await this.$axios.$get("/api/user/logout", {
      withCredentials: true
    });

    return true;
  }
};
