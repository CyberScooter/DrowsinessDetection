
import { AppRegistry, StyleSheet, Text, Alert, TouchableOpacity, View, Button, Dimensions } from 'react-native';
import {Camera} from 'expo-camera'
import React, { useState} from 'react'
import {cameraWithTensors} from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
const TensorCamera = cameraWithTensors(Camera);


export default function CameraComponent() {  


    React.useEffect(() => {
        const prepare = async () => {
          await tf.ready();
          const camera = await Camera.requestCameraPermissionsAsync()
        };
        prepare();
    }, []);

    const handleCameraStream = async () => {
        const loop = async () => {
            requestAnimationFrame(loop);
        };
      
        loop();
    }

    let textureDims = {
        height: 1200,
        width: 1600,
      };

    return (
      <View style={styles.container}>
        <TensorCamera
          style={styles.camera}
          type={Camera.Constants.Type.back}
          resizeWidth={240}
          resizeHeight={180}
          resizeDepth={3}
          onReady={handleCameraStream}
          onMountError={err => console.log(err)}
        />
      </View>
    )


}

const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: -1,
      top: 0,
      left: 0,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    camera: {
      position: 'absolute',
      width: 270,
      height: 360,
    },
  });