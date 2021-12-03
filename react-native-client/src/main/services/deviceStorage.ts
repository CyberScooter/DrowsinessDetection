import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveJWT(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log("AsyncStorage Error: " + error.message);
  }
}

export async function loadJWT(key) {
  try {
    let value = await AsyncStorage.getItem(key);
    return JSON.parse(value);
  } catch (error) {
    console.log("AsyncStorage Error: " + error.message);
  }
}

export async function clearAsyncStorage() {
  await AsyncStorage.removeItem("jwtKey");
}
