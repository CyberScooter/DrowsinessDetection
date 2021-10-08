import * as cookie from 'cookie';
import { v4 as uuid } from '@lukeed/uuid';
import http from "$lib/http"

export const handle = async ({ request, resolve }) => {
	request.locals.access_token = cookie.parse(request.headers.cookie ?? "")[
	  "sessionid"
	];

	// console.log(request.locals.access_token);
  
	const response = await resolve(request);
	return {
	  ...response,
	  headers: {
		...response.headers,
	  },
	};
};

/** @type {import('@sveltejs/kit').GetSession} */
export async function getSession(req) {

	const context = req.locals;
	let data;
	let authenticated = !!context.access_token ? true : false

	if(!!context.access_token)
		data = await http(fetch, context.access_token)('/user/data')

	let initSession = {
	  user: !!data ? data.user : {},
	  access_token: context.access_token,
	  authenticated,
	};
  
	return initSession;
  }
  
