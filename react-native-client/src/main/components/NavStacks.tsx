import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import Camera from './Camera';

function HomeScreen({navigation}, props) {

    const pressHandler = () => {
      navigation.navigate('Lobby room')
    }
    if(!props.authenticated){
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Button title="Drowsiness detection lobby" onPress={pressHandler}/>
          <Button title="Login" onPress={() => console.log("lel")}/>
          <Button title="Register" onPress={() => console.log("lel")}/>
        </View>
      );
    }else {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Button title="Drowsiness detection lobby" onPress={pressHandler}/>
        </View>
      );
    }

  }

const windows = {
    Home: {
        screen: HomeScreen
    },
    "Lobby room": {
        screen: Camera
    },
    // Login: {

    // },
    // Register: {

    // }
}

const NavStack = createStackNavigator(windows)

export default createAppContainer(NavStack)

