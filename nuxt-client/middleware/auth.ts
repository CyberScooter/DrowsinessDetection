export default function({ store, redirect, context, route }) {
  // If the user is  authenticated

  console.log(route.path);

  if (
    store.state.users.auth != null &&
    (route.path == "/login" || route.path == "/register")
  ) {
    return redirect("/");
  } else if (
    store.state.users.auth == null &&
    (route.path == "/login" || route.path == "/register")
  ) {
    // return redirect("/");
  } else if (store.state.users.auth == null) {
    redirect("/");
  }
}
