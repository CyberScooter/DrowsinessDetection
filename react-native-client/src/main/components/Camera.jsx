import { AppRegistry, StyleSheet, Text, Alert, TouchableOpacity, View, Button, Dimensions } from 'react-native';
import {Camera} from 'expo-camera'
import { Audio } from 'expo-av';
import React, { useState} from 'react'
import { useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
// import {io} from 'socket.io-client';
import * as Location from 'expo-location';
import {GLView} from 'expo-gl'

import { captureRef } from 'react-native-view-shot';
import io from 'socket.io-client'
import { Buffer } from 'buffer'
import {useNetInfo} from '@react-native-community/netinfo';

import Orientation from 'react-native-orientation';
import {cameraWithTensors} from '@tensorflow/tfjs-react-native';
import { LogBox } from 'react-native';
import tensorAsBase64 from 'tensor-as-base64';
import * as jpeg from 'jpeg-js';
import base64 from 'react-native-base64'
import * as Permissions from 'expo-permissions';
import useForceUpdate from 'use-force-update';
// import {initiateSocket, disconnectSocket, sendFrame} from './FrameCaptureSocket'

let instances = 0;
let frameCount = 0;
let userID;
const socket = io("https://9759-86-24-137-183.ngrok.io" , {reconnection: false});

export default function CameraComponent({route}) {  

  const netInfo = useNetInfo()

  const [camera, startCamera] = useState(false)
  const [socketInit, setSocketInit] = useState(false)
  const [refreshCamera, setRefreshCamera] = useState(0)
  const [permissions, setPermissions] = useState("")

  const TensorCamera = cameraWithTensors(Camera);

  useEffect( () => {
    
    const fetchData = async () => {
      await tf.ready();
      const camera = await Camera.requestPermissionsAsync()
      const location = await Location.requestForegroundPermissionsAsync();
      if (camera.status !== 'granted') {
          setPermissions("Camera permission not enabled, enable to use the drowsiness detection")
      }else if(location.status !== 'granted'){
          setPermissions("Location permission not enabled, enable to use the drowsiness detection")
      }
    }

    if(!socketInit) {
      // userID = route.params.userID
      socket.on("connect", (e) => { console.log(e) });

      setSocketInit(true)
      fetchData();
      // return

      socket.addEventListener("frameAnalysis", async function (event) {
        if(instances == 2) {
          let location;
          try{
            location = await Location.getCurrentPositionAsync({});

            // REST API request location.latitude, location.longitude
          }catch(_){

          }
          console.log(location);
          instances = 0;
          return
        }

        if (event === undefined) {
          return;
        }

        if (event == "DROWSY" || event == "DEAD") {
          frameCount++;
        } else {
          frameCount = 0;
        }

        if (frameCount >= 3) {
          console.log(event);
          frameCount = 0;
          instances++;
          return
        } 
      });
    }





  })


  const handleCameraStream = (imageAsTensors , updatePreview, gl) => {
    const loop = async () => {

        try{
          let tensor = await imageAsTensors.next().value

          const data = await tensor.array()

          socket.emit("frame", {
              frame: data
          });

          updatePreview();
          gl.endFrameEXP();

          tf.dispose(tensor);
        }catch(e){
          
        }

      await new Promise(resolve => setTimeout(resolve, 500 || DEF_DELAY));

      requestAnimationFrame(loop);
      
  }

  if(camera) loop();
    // const loop = async () => {
    //   const tensor = await imageAsTensors.next().value

    //   if(!repeat){
    //     if(!!tensor){
    //       const [height, width] = tensor.shape
    //       const data = new Buffer(
    //       // concat with an extra alpha channel and slice up to 4 channels to handle 3 and 4 channels tensors
    //       tf.concat([tensor, tf.ones([height, width, 1]).mul(255)], [-1])
    //           .slice([0], [height, width, 4])
    //           .dataSync(),
    //       )

    //       const rawImageData = {data, width, height};
    //       const jpegImageData = jpeg.encode(rawImageData, 200);

    //       tempImgBase64 = tf.util.decodeString(jpegImageData.data, "base64")

    //       if(tempImgBase64 == imgBase64){
    //         // console.log("ran");
    //         // repeat = true;
    //       }
    //       // console.log(repeat);

    //       imgBase64 = tempImgBase64

    //       // console.log(socket);
    //       // socket.emit("frame", {
    //       //   frame: tempImgBase64,
    //       // });

    //       // setTimeout(() => setBase64(imgBase64), 500)
          
    //       // console.log(encoded);

    //       // tf.dispose([tensor]);


    //       // let items = nextImageTensor.filter((item) => item !== 0 )
    //       // console.log(items.length);
    //       // const encoded = base64.encodeFromByteArray(nextImageTensor);
    //       // console.log(encoded);
    //       // await getPrediction(nextImageTensor);

    //       await sleep(500)


    //       requestAnimationFrame(loop);
    //     }
    //   }else {
    //     repeat = false;
    //     imgBase64 = "-1";
    //     tempImgBase64 = "-2";
    //     console.log("asdfasdfadf");
    //     forceUpdate();
    //   }

    // };

    // if(startCamera) loop()

    // if(startCamera) {
    //   if(repeat){
    //     repeat = false;
    //     console.log("asdfasdfadf");
    //     setRefreshCamera(!refreshCamera)
    //   }else {
    //     // imgBase64 = tempImgBase64
    //     loop()
    //   }      
    // }


    // const loop = async (image, updatePreview, gl) => {

    //   let result = await captureRef(pageView, {format: 'jpg', quality: 1.0});

      
    //   updatePreview();
    //   gl.endFrameEXP();
      
    //   console.log(result);
  
    // }

    // loop()

    // interval = setInterval(async () => {
    //   const tensor = imageAsTensors.next().value

    //   if(!!tensor){
    //     const [height, width] = tensor.shape
    //     const data = new Buffer(
    //     // concat with an extra alpha channel and slice up to 4 channels to handle 3 and 4 channels tensors
    //     tf.concat([tensor, tf.ones([height, width, 1]).mul(255)], [-1])
    //         .slice([0], [height, width, 4])
    //         .dataSync(),
    //     )

    //     const rawImageData = {data, width, height};
    //     const jpegImageData = jpeg.encode(rawImageData, 200);

    //     tempImgBase64 = tf.util.decodeString(jpegImageData.data, "base64")

    //     if(tempImgBase64 == imgBase64){
    //       repeat = true;
    //     }


    //     imgBase64 = tempImgBase64
        

    //     // console.log(imgBase64);
    //     // console.log(socket);
    //     socket.emit("frame", {
    //       frame: tempImgBase64,
    //     });


    //     // setTimeout(() => setBase64(imgBase64), 500)
        
    //     // updatePreview();
    //     // gl.endFrameEXP();


    //     // await tf.nextFrame()
    //     // console.log(encoded);
    //     tf.dispose([tensor]);



    //     // let items = nextImageTensor.filter((item) => item !== 0 )
    //     // console.log(items.length);
    //     // const encoded = base64.encodeFromByteArray(nextImageTensor);
    //     // console.log(encoded);
    //     // await getPrediction(nextImageTensor);

    //     // await sleep(1000)
    //   }

  
    // }, 500)

  }

  const startCapturing = () => {
    startCamera(true)
  }

  const stopCapturing = () => {
    startCamera(false)
  }

  const DEF_DELAY = 1000;

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
  }

  let buttonDisplayed;


  // props.route.params.authenticated
  let textureDims = {
    height: 1200,
    width: 1600,
  };

  if(!camera) {
    return (
      <View style={{position: 'relative',height: 500, alignItems: 'center', justifyContent: 'center',}} >
        <Button title="Start capturing" onPress={() => startCapturing()}/>

      </View>
    )
  }else if(!!permissions){
    return (
      <View style={{position: 'relative',height: 500, alignItems: 'center', justifyContent: 'center',}}>
        <Text >
          {permissions}
        </Text>
      </View>

    ) 
    
  }else {
    return (
        <View collapsable={false} style={{
          padding: 50,
          backgroundColor: netInfo.isConnected ? 'transparent' : 'coral',
        }} >

          <TensorCamera
            style={styles.preview}
            // Standard Camera props
            type={Camera.Constants.Type.front}
            // Tensor related props
            zoom={0}
            cameraTextureHeight={textureDims.height}
            cameraTextureWidth={textureDims.width}
            resizeHeight={80}
            resizeWidth={72}
            zoom={0.4}
            resizeDepth={3}
            onReady={handleCameraStream}
            autorender={true}
          />

          <View style={{marginTop: 40}}>
            <Button title="Stop capturing" onPress={() => stopCapturing()}/>

          </View>

          {/* <Camera 
            style={styles.preview}
            type={Camera.Constants.Type.front}
          /> */}

        </View>

    )
  }



  


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
