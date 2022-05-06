import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Button } from "react-native";
import { Camera } from "expo-camera";
import { flaskURL } from "../../env";
import io from "socket.io-client";
import axios from "axios";
import { loadJWT } from "./services/deviceStorage";
import { restAPIURL } from "../../env";

// const socket = io(flaskURL , {reconnection: false});
cameraRef = React.createRef();
let socket;
export default function FaceCalibration() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.front);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      const camera = await Camera.requestCameraPermissionsAsync();

      if (camera.status !== "granted") {
        setPermissions(
          "Camera permission not enabled, enable to use the drowsiness detection"
        );
      }
    };

    fetchData();

    return () => {
      // prevent memory leaks
      mounted = false;
    };
  }, []);

  async function calculateEAR(type) {
    const options = {
      quality: 1,
      base64: true,
      fixOrientation: true,
      exif: true,
    };
    let result = await cameraRef.current.takePictureAsync(options);

    if (type == "closed_or_drowsy") {
      try {
        setDisplayText("~ Loading ~");

        let { data } = await axios.post(`${flaskURL}/earValue`, {
          drowsy: result.base64,
        });

        if (data.response == "Face not found") {
          setDisplayText("Cannot find face");
        } else if (data.response) {
          let token = await loadJWT("jwtKey");
          let res = await axios.post(
            `${restAPIURL}/api/user/updateEARValue`,
            { earValue: data.response },
            {
              headers: {
                Authorization: "Bearer " + token, //the token is a variable which holds the token
              },
            }
          );

          if (res.data.message) {
            setDisplayText("Value set");
          } else {
            setDisplayText("Error has occured");
          }
        }
      } catch (_) {
        setDisplayText("Error has occured");
      }
    }
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}></Camera>
      <Text style={styles.message}>{displayText}</Text>
      <View style={styles.buttons}>
        <Button
          title="Save EAR for drowsy or closed eyes"
          onPress={() => {
            calculateEAR("closed_or_drowsy");
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    width: 300,
    height: 400,
    zIndex: 1,
    borderWidth: 0,
    borderRadius: 0,
    alignSelf: "center",
    marginBottom: 20,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "column",
  },
  preview: {
    justifyContent: "flex-end",
    alignSelf: "center",
    width: 700 / 2,
    height: 800 / 2,
  },
  capture: {
    flex: 0,
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: "center",
    margin: 20,
  },
  buttons: {
    marginBottom: 20,
  },
  message: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
});
