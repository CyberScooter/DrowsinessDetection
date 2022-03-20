import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import Camera from './src/main/components/Camera';
import LobbyRoom from './src/main/LobbyRoom/LobbyRoom';
import LobbyMembers from './src/main/LobbyRoom/LobbyMembers';
import NewLobbyForm from './src/main/components/NewLobbyForm';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { loadJWT, clearAsyncStorage} from './src/main/services/deviceStorage'
import Login from './src/main/Login'
import Register from './src/main/Register'
import FaceCalibration from './src/main/FaceCalibration'
import Test from './src/main/components/Test'
import Test2 from './src/main/components/TestCamera'

const Stack = createNativeStackNavigator();

function HomeScreen({navigation}) {
  const [loggedIn, setLoggedIn] = React.useState(false)


  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      async function getJWT(){
        // await clearAsyncStorage()
        let test = await loadJWT("jwtKey")
        if(test !== null){
          setLoggedIn(true)
        }else {
          setLoggedIn(false)
        }
      }

      getJWT()
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  async function logout(){
    await clearAsyncStorage()
    setLoggedIn(false)
  }

  if(!loggedIn) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#A9A9A9'}}>
        <View style={{marginBottom: 30}}>
          <Button title="Go to camera" onPress={() => {navigation.navigate("Driver")}}/>
        </View>
        <View style={{marginBottom: 30}}>
          <Button title="Login" onPress={() => {navigation.navigate("Login")}}/>
        </View>
        <View style={{marginBottom: 30}}>
          <Button title="Register" onPress={() => {navigation.navigate("Register")}}/>
        </View>
        {/* <View style={{marginBottom: 30}}>
          <Button title="Test" onPress={() => {navigation.navigate("Test")}}/>
        </View>
        <View style={{marginBottom: 30}}>
          <Button title="Test2" onPress={() => {navigation.navigate("Test2")}}/>
        </View> */}
      </View>
    );
  }else {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#A9A9A9'}}>
        {/* <View style={{marginBottom: 30}}>
          <Button title="Go to camera" onPress={() => {navigation.navigate("Driver")}}/>
        </View> */}
        <View style={{marginBottom: 30}}>
          <Button title="Driver drowsiness detection lobby room" onPress={() => {navigation.navigate("Lobby", {authenticated: true})}} />
        </View>
        <View style={{marginBottom: 30}}>
          <Button title="Calibrate face (optional)" onPress={() => {navigation.navigate("Face Calibration")}} />
        </View>
        <View style={{marginBottom: 30}}>
          <Button title="Logout" onPress={() => logout()}/>
        </View>
        {/* <View style={{marginBottom: 30}}>
          <Button title="Test" onPress={() => {navigation.navigate("Test")}}/>
        </View> */}
      </View>
    );
  }


}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" options={{orientation: 'portrait'}} component={HomeScreen}  />
        <Stack.Screen name="Login" options={{orientation: 'portrait', contentStyle: {backgroundColor: '#A9A9A9'}}} component={Login}/>
        <Stack.Screen name="Register" options={{orientation: 'portrait', contentStyle: {backgroundColor: '#A9A9A9'}}} component={Register}/>
        <Stack.Screen name="Face Calibration" options={{orientation: 'portrait', contentStyle: {backgroundColor: '#A9A9A9'}}} component={FaceCalibration}/>
        <Stack.Screen name="Lobby" options={{orientation: 'portrait', contentStyle: {backgroundColor: '#A9A9A9'}}} component={LobbyRoom}/>
        <Stack.Screen name="NewLobbyForm" options={{orientation: 'portrait'}} component={NewLobbyForm}  />
        <Stack.Screen name="Test" options={{orientation: 'portrait'}} component={Test}  />
        <Stack.Screen name="Test2" options={{orientation: 'portrait'}} component={Test2}  />
        <Stack.Screen name="Driver" options={{title: "Drowsy detection"}} component={Camera} initialParams={{'authenticated':true}}/>
        <Stack.Screen name="Members" options={{title: "Lobby members", orientation: 'portrait', contentStyle: {backgroundColor: '#A9A9A9'}}} component={LobbyMembers}/>
      </Stack.Navigator>
    </NavigationContainer>

  );
  // return (
  //   <View style={styles.container}>
  //     <Camera accessToken="34343434"/>
  //     <StatusBar style="auto" />
  //   </View>
  // );

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
