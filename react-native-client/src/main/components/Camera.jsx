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
import {flaskURL, restAPIURL} from '../../../env'
import { PermissionsAndroid } from 'react-native';
import axios from 'axios';
import {loadJWT} from '../services/deviceStorage'

// import {initiateSocket, disconnectSocket, sendFrame} from './FrameCaptureSocket'

let instances = 0;
let frameCount = 0;
let userID;
let drowsyAlert = false;
let longitude = 0;
let latitude = 0
let socket;


export default function CameraComponent({route}) {  

  const netInfo = useNetInfo()

  

  const [camera, startCamera] = useState(false)
  const [refreshCamera, setRefreshCamera] = useState(0)
  const [permissions, setPermissions] = useState("")
  const [displayText, setDisplayText] = useState("")
  const [showStartCapture, setStartCapture] = useState(false)

  const TensorCamera = cameraWithTensors(Camera);

  useEffect( () => {
    let mounted = true 

    if(route.params.occupiedID){
      init = true
      setStartCapture(true)
    }
    
    const fetchData = async () => {
      await tf.ready();
      const camera = await Camera.requestPermissionsAsync()
      const location = await Location.requestForegroundPermissionsAsync();
      await Location.getCurrentPositionAsync({}).catch(() => {
        setPermissions("Camera permission not enabled, enable to use the drowsiness detection")
      })
      if (camera.status !== 'granted') {
          setPermissions("Camera permission not enabled, enable to use the drowsiness detection")
      }
      if(location.status !== 'granted'){
          setPermissions("Location permission not enabled, enable to use the drowsiness detection")
      }

    }

    if(camera) {
      console.log("asdl;fkaposkfpoask");
      fetchData();

      // socket = io(flaskURL , {reconnection: true});
      socket = io(flaskURL, {reconnection: false});
      if(!socket.hasListeners('frameAnalysis')){
        socket.addEventListener("frameAnalysis", async function (event) {
          if(instances == 2) {
            instances = 0;
            
            let location;
            location = await Location.getCurrentPositionAsync({});
            longitude = location.coords.longitude
            latitude = location.coords.latitude
            drowsyAlert = true
            startCamera(false)

              
  

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
    }else {
      if(drowsyAlert){
        updateLocation(longitude, latitude)
        longitude = 0
        latitude = 0
        drowsyAlert = false
    
        setDisplayText("Park your car, drowsy")



      }
    }

    // if(!camera) {
    //   if(!!socket){
    //     console.log(socket);
    //     if(socket.connected){
    //       socket.close()
    //     }
    //   }
      
    // }


    return () => {
      // prevent memory leaks
        mounted = false 
    }
    // if(!socketInit) {
      // console.log(route.params.lobbyID);
      
      // userID = route.params.userID
      // socket.on("connect", (e) => { console.log(e) });

      // fetchData();

      // socketInit = true
      // return

      
    // }

  }, [camera])

  async function updateLocation(longitude, latitude){
    let token = await loadJWT("jwtKey") 
    console.log("lol")
    await axios.post(`${restAPIURL}/api/tracker/updateLocation`, {longitude: longitude, latitude: latitude, lobbyID: route.params.lobbyID},{
        headers: {
          Authorization: 'Bearer ' + token //the token is a variable which holds the token
        }
    })

  }

  const handleCameraStream = async (imageAsTensors , updatePreview, gl) => {
    const loop = async () => {

        try{
          let tensor = await imageAsTensors.next().value

          const data = await tensor.array()

          if(!!socket)
            socket.emit("frameCNNClassification", {
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

  }

  const startCapturing = async () => {

    startCamera(true)
  }

  const occupyLobby = async () => {
    let token = await loadJWT("jwtKey") 
    let {data} = await axios.post(`${restAPIURL}/api/tracker/setOccupied`, {lobbyID: route.params.lobbyID},{
      headers: {
        Authorization: 'Bearer ' + token //the token is a variable which holds the token
      }
    })

    if(data.error){
      setDisplayText(`${data.error} check lobby members to see who is currently using`)
    }
    setStartCapture(true)
  }

  const freeLobby = async () => {
    let token = await loadJWT("jwtKey") 
    await axios.post(`${restAPIURL}/api/tracker/setVacant`, {lobbyID: route.params.lobbyID},{
      headers: {
        Authorization: 'Bearer ' + token //the token is a variable which holds the token
      }
    })

    setStartCapture(false)

  }

  const stopCapturing = async () => {
    socket.close()

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
  

  let startCaptureComponent = showStartCapture ? <Button title="Start capturing" onPress={() => startCapturing()}/> : null
  if(!camera) {
    return (
      <View style={{position: 'relative',height: 500, alignItems: 'center', justifyContent: 'center',}} >
        {!showStartCapture ? <Button title="Occupy drowsiness detection" onPress={() => occupyLobby()}/> : null}
        {showStartCapture && !camera ? <Button title="Vacate drowsiness detection slot (Also clears stored location values)" onPress={() => freeLobby()}/> : null}
        <View style={{marginTop: 20}}>
          {!!displayText ? <Text style={{fontSize: 20, fontWeight: 'bold', color: 'red'}}>{displayText}</Text> : startCaptureComponent}
        </View>
        

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
