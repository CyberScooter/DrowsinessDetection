// TODO: cleanup unused imports
import {
  AppRegistry,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
  View,
  Button,
  Dimensions,
} from "react-native";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";
import React, { useState } from "react";
import { useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import * as Location from "expo-location";
import io from "socket.io-client";
import { useNetInfo } from "@react-native-community/netinfo";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
import { flaskURL, restAPIURL } from "../../../env";
import axios from "axios";
import { loadJWT } from "../services/deviceStorage";
import * as Speech from "expo-speech";

let frameCount = 0;
let drowsyAlert = false;
let longitude = 0;
let latitude = 0;
let socket;

let drowsyOrClosedEAR;
let previousNetworkState;
let detectionType;

export default function CameraComponent({ route }) {
  const netInfo = useNetInfo();

  const [camera, startCamera] = useState(false);
  const [permissions, setPermissions] = useState("");
  const [displayErrorText, setDisplayErrorText] = useState("");
  const [showCallibratedFaceOption, setCallibratedFaceOption] = useState(false);
  const [showVacateSlot, setVacateSlotOption] = useState(false);

  const TensorCamera = cameraWithTensors(Camera);

  useEffect(() => {
    let mounted = true;

    async function checkCallibratedFace() {
      let token = await loadJWT("jwtKey");
      let { data } = await axios.get(`${restAPIURL}/api/user/getEARValue`, {
        headers: {
          Authorization: "Bearer " + token, //the token is a variable which holds the token
        },
      });

      if (data.drowsyorclosedear != null) {
        drowsyOrClosedEAR = data.drowsyorclosedear;
        setCallibratedFaceOption(true);
      } else {
        setCallibratedFaceOption(false);
      }
    }

    checkCallibratedFace();

    if (route.params.occupiedID) {
      setVacateSlotOption(true);
    }

    const fetchData = async () => {
      await tf.ready();
      const camera = await Camera.requestCameraPermissionsAsync();
      const location = await Location.requestForegroundPermissionsAsync();
      await Location.getCurrentPositionAsync({}).catch(() => {
        setPermissions(
          "Camera permission not enabled, enable to use the drowsiness detection"
        );
      });
      if (camera.status !== "granted") {
        setPermissions(
          "Camera permission not enabled, enable to use the drowsiness detection"
        );
      }
      if (location.status !== "granted") {
        setPermissions(
          "Location permission not enabled, enable to use the drowsiness detection"
        );
      }
    };

    if (camera) {
      fetchData();

      // socket = io(flaskURL , {reconnection: true});
      socket = io(flaskURL, { reconnection: false });
      if (!socket.hasListeners("frameAnalysis")) {
        socket.addEventListener("frameAnalysis", async function (event) {
          if (event === undefined) {
            return;
          }

          if (event == "DROWSY") {
            frameCount++;
          } else {
            frameCount = 0;
          }

          if (frameCount > 1) {
            let location;
            location = await Location.getCurrentPositionAsync({});
            longitude = location.coords.longitude;
            latitude = location.coords.latitude;
            drowsyAlert = true;
            startCamera(false);
          }
        });
      }
    } else {
      if (drowsyAlert) {
        updateLocation(longitude, latitude);
        longitude = 0;
        latitude = 0;
        drowsyAlert = false;

        setDisplayErrorText("Park your car, drowsy");
      }
    }

    return () => {
      // prevent memory leaks
      mounted = false;
    };
  }, [camera]);

  async function updateLocation(longitude, latitude) {
    let token = await loadJWT("jwtKey");
    Speech.speak("Please park your car at the nearest and safest place");
    await axios.post(
      `${restAPIURL}/api/tracker/updateLocation`,
      {
        longitude: longitude,
        latitude: latitude,
        lobbyID: route.params.lobbyID,
      },
      {
        headers: {
          Authorization: "Bearer " + token, //the token is a variable which holds the token
        },
      }
    );
  }

  const handleCameraStream = async (imageAsTensors, updatePreview, gl) => {
    const loop = async () => {
      try {
        let tensor = await imageAsTensors.next().value;

        const data = await tensor.array();

        if (!!socket)
          socket.emit(detectionType, {
            frame: data,
            closed_or_drowsy: drowsyOrClosedEAR,
          });

        updatePreview();
        gl.endFrameEXP();

        tf.dispose(tensor);
      } catch (_) {}

      await new Promise((resolve) => setTimeout(resolve, 350 || DEF_DELAY));

      requestAnimationFrame(loop);
    };

    if (!netInfo.isConnected) {
      Speech.speak(
        "Network coverage has been lost, please park your car if you're drowsy"
      );
      previousNetworkState = true;
    } else {
      if (previousNetworkState) {
        Speech.speak(
          "Network coverage is back, detection system is back online"
        );
        socket = io(flaskURL, { reconnection: false });
        previousNetworkState = false;
      }
      if (camera) loop();
    }
  };

  const startCapturing = async (type) => {
    if (type == "EAR") {
      detectionType = "frameFaceCallibrated";
      startCamera(true);
    } else if (type == "CNN") {
      detectionType = "frameCNNClassification";
      startCamera(true);
    }
  };

  const occupyLobby = async () => {
    let token = await loadJWT("jwtKey");
    let { data } = await axios.post(
      `${restAPIURL}/api/tracker/setOccupied`,
      { lobbyID: route.params.lobbyID },
      {
        headers: {
          Authorization: "Bearer " + token, //the token is a variable which holds the token
        },
      }
    );

    if (data.error) {
      setDisplayErrorText(
        `${data.error} check lobby members to see who is currently using`
      );
    }
    setVacateSlotOption(true);
  };

  const freeLobby = async () => {
    let token = await loadJWT("jwtKey");
    await axios.post(
      `${restAPIURL}/api/tracker/setVacant`,
      { lobbyID: route.params.lobbyID },
      {
        headers: {
          Authorization: "Bearer " + token, //the token is a variable which holds the token
        },
      }
    );

    setVacateSlotOption(false);
  };

  const stopCapturing = async () => {
    socket.close();

    startCamera(false);
  };

  const DEF_DELAY = 1000;

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms || DEF_DELAY));
  }

  let buttonDisplayed;

  // props.route.params.authenticated
  let textureDims = {
    height: 800,
    width: 600,
  };

  let earCapturingComponent = showCallibratedFaceOption ? (
    <Button
      title="Detect drowsiness using callibrated face"
      onPress={() => startCapturing("EAR")}
    />
  ) : (
    <Text style={{ textAlign: "center", fontSize: 20 }}>
      Callibrate face in the Home Menu to use EAR drowsy detection
    </Text>
  );
  let cnnCapturingComponent = (
    <Button
      title="Detect drowsiness using CNN"
      onPress={() => startCapturing("CNN")}
    />
  );
  if (!camera) {
    return (
      <View
        style={{
          position: "relative",
          height: 500,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ marginBottom: 20 }}>
          {/* && showVacateSlot */}
          {!!displayErrorText || !showVacateSlot ? (
            <View>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "red" }}>
                {displayErrorText}
              </Text>
            </View>
          ) : (
            <View>
              <View style={{ paddingBottom: 20 }}>{earCapturingComponent}</View>
              {cnnCapturingComponent}
            </View>
          )}
        </View>
        {!showVacateSlot ? (
          <Button title="Occupy slot" onPress={() => occupyLobby()} />
        ) : null}
        {showVacateSlot && !camera ? (
          <Button
            title="Vacate slot in this lobby"
            onPress={() => freeLobby()}
          />
        ) : null}
      </View>
    );
  } else if (!!permissions) {
    return (
      <View
        style={{
          position: "relative",
          height: 500,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>{permissions}</Text>
      </View>
    );
  } else {
    return (
      <View
        collapsable={false}
        style={{
          padding: 50,
          backgroundColor: netInfo.isConnected ? "transparent" : "coral",
        }}
      >
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

        <View style={{ marginTop: 40 }}>
          <Button title="Stop capturing" onPress={() => stopCapturing()} />
        </View>

        {/* <Camera 
            style={styles.preview}
            type={Camera.Constants.Type.front}
          /> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  camera: {
    width: 700 / 2,
    height: 800 / 2,
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
  buttonStyle: {
    marginHorizontal: 20,
    marginBottom: 5,
  },
});
