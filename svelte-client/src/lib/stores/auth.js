import { derived, writable } from "svelte/store";
import http from "$lib/http";

export default class AuthStore {
    state = {
        access_token: "",
        user: {},
        authenticated: false,
    };

    constructor(state){
        this.state = state
    }

    logoutUser() {}

    async loginUser(form) {
        const {data} = http.post("/api/user/login", {
            username: form.username,
            password: form.password
        })

        if(!data.error) {
            return this.setUser(data)
        }else {
            return {error: data.error};
        }
    }

    async registerUser(form) {
        const {data} = await http.post("/api/user/register", form)

        if(!data.error) {
            return this.setAuth(data)
        }else {
            return {error: data.error}
        }
    }

    async setAuth({username, email}){
        await this.state.update((value) => {
            return { ...value, user: {username, email}, access_token: ""}
        })
    }
}

