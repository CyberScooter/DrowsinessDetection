import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import Camera from './src/main/components/Camera';
import LobbyRoom from './src/main/LobbyRoom/LobbyRoom';
import LobbyMembers from './src/main/LobbyRoom/LobbyMembers';
import NewLobbyForm from './src/main/components/NewLobbyForm';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import NavStacks from './src/main/components/NavStacks';

const Stack = createNativeStackNavigator();

function HomeScreen({navigation}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#A9A9A9'}}>
      <Button title="Go to camera" onPress={() => {navigation.navigate("Driver")}}/>
      <Button title="Driver drowsiness detection lobby room" onPress={() => {navigation.navigate("Lobby", {authenticated: true})}} />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" options={{orientation: 'portrait'}} component={HomeScreen}  />
        <Stack.Screen name="Lobby" options={{orientation: 'portrait', contentStyle: {backgroundColor: '#A9A9A9'}}} component={LobbyRoom}/>
        <Stack.Screen name="NewLobbyForm" options={{orientation: 'portrait'}} component={NewLobbyForm}  />
        <Stack.Screen name="Driver" options={{title: "Driving mode on"}} component={Camera} initialParams={{'authenticated':true}}/>
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
