
import { AppRegistry, StyleSheet, Text, Alert, TouchableOpacity, View, Button, Dimensions } from 'react-native';
import {Camera} from 'expo-camera'
import React, { useState} from 'react'
import {cameraWithTensors} from '@tensorflow/tfjs-react-native';

let camera;
export default function CameraComponent() {  



    async function snap(){

        if (camera) {
            let photo = await camera.takePictureAsync({skipProcessing : true});
            console.log(photo);
        }
    };

    const handleFacesDetected = async (obj) => {
        console.log(camera.base64);
        if(obj.faces.length > 0) {
            await camera.takePictureAsync()
        }

    }; 


    return (
        <View>

            <Button title="Start" onPress={() => snap()}/>
            <Button title="Stop" onPress={() => snap()}/>
        </View>
    )


}

const styles = StyleSheet.create({
    camera: {
      width: 700/2,
      height: 800/2,
      zIndex: 1,
      borderWidth: 0,
      borderRadius: 0,
      alignSelf: 'center',
      marginBottom: 20
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      flexDirection: 'column',
    },
    preview: {
      justifyContent: 'flex-end',
      alignSelf: 'center',
      width: 700/2,
      height: 800/2,
    },
    capture: {
      flex: 0,
      backgroundColor: '#fff',
      borderRadius: 5,
      padding: 15,
      paddingHorizontal: 20,
      alignSelf: 'center',
      margin: 20,
    },
    buttonStyle: {
      marginHorizontal: 20,
      marginBottom: 5
    }
  });
  