import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Button } from 'react-native';
import { Camera } from 'expo-camera';
import { flaskURL } from '../../env';
import io from 'socket.io-client'


// const socket = io(flaskURL , {reconnection: false});
cameraRef = React.createRef();

export default function FaceCalibration() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.front);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');

      socket.on("connect", (e) => { console.log(e) });
      socket.addEventListener("openEARValueResponse", async function (event) {
        console.log(event);
 

      })
      socket.addEventListener("closedEARValueResponse", async function (event) {
 

      })
      socket.addEventListener("drowsyEARValueResponse", async function (event) {
 

      })
    })();
  }, []);

  async function saveEARValue(type, value){

  }

  async function calculateEAR(type){
    const options = { quality: 1, base64: true, fixOrientation: true, exif: true};
    let result = await cameraRef.current.takePictureAsync(options)

    if(type== "open"){
      console.log("ran");
      socket.emit("openEARValue", {
        earValue: result.base64
      });

    }else if(type == "drowsy"){
      socket.emit("drowsyEARValue", {
        earValue: result.base64
      });

    }else if(type == "closed"){
      socket.emit("closedEARValue", {
        earValue: result.base64
      });

    }

  }

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}/>
      <View style={styles.buttons}>
        <Button title="Save EAR for awake eyes" onPress={() => {calculateEAR("open")}}/>
      </View>
      <View style={styles.buttons}> 
        <Button title="Save EAR for drowsy eyes" onPress={() => {calculateEAR("drowsy")}}/>
      </View>
      <View style={styles.buttons}>
        <Button title="Save EAR for closed eyes" onPress={() => {calculateEAR("closed")}}/>
      </View>
    </View>
  );
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
    buttons: {
      marginBottom: 20
    }
  });
  