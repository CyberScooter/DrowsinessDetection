import axios from "axios";
import Cookie from "js-cookie";

function requestHandler(f, access_token) {
  let headers = { "Content-Type": "application/json" };
  if (access_token) {
    headers["authorization"] = `Bearer ${access_token}`;
  } 
  return async function (route, method, data) {
    return (
      await f(`http://localhost:3002/${route}`, {
        method: method || "GET",
        ...(() => {
          if (data) {
            return { body: JSON.stringify(data) };
          }
          return {};
        })(),
        headers: { ...headers },
      })
    ).json();
  };
}
export default requestHandler;