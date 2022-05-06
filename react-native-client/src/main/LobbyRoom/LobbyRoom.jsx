import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  SectionList,
  StatusBar,
  Button,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { restAPIURL } from "../../../env";
import axios from "axios";
import { loadJWT } from "../services/deviceStorage";
import * as Notifications from "expo-notifications";

let trackingInterval = {
  lobbyID: null,
  userID: null,
  interval: null,
};

export default function LobbyRoom({ route, navigation }) {
  const [items, setItems] = React.useState({ items: [], displayText: "" });
  const [userData, setUserData] = React.useState({ id: 0, token: "" });

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  useEffect(() => {
    let mounted = true;

    const unsubscribe = navigation.addListener("focus", () => {
      setItems({ displayText: "~ Loading lobbies ~", items: [] });
      loadLobbies();
    });
    return () => {
      // prevent memory leaks
      mounted = false;
      unsubscribe;
    };
    // Return the function to unsubscribe from the event so it gets removed on unmount
  }, [navigation]);

  async function loadLobbies() {
    let token = await loadJWT("jwtKey");
    let { data } = await axios.get(`${restAPIURL}/api/user/data`, {
      headers: {
        Authorization: "Bearer " + token, //the token is a variable which holds the token
      },
    });

    setUserData({ id: data.user.id, token: token });

    let items = [];

    axios
      .get(`${restAPIURL}/api/lobby/list`, {
        headers: {
          Authorization: "Bearer " + token, //the token is a variable which holds the token
        },
      })
      .then((res) => {
        if (res.data.length == 0) {
          setItems({ displayText: "No lobbies found", items: [] });
          return;
        }

        items = res.data.map((el) => {
          let data = [
            {
              id: "numberOfMembers",
              count: el.member_count,
              joinCode: el.join_code,
            },
          ];

          if (el.user_tracking != 0) {
            let lobbyTracking = false;
            if (
              !!trackingInterval.lobbyID &&
              el.lobby_id == trackingInterval.lobbyID
            )
              lobbyTracking = true;

            data.push({
              id: "lobbyActive",
              userIDTracking: el.user_tracking,
              lobbyActive: true,
              lobbyTracking: lobbyTracking,
            });
          } else {
            data.push({
              id: "lobbyInactive",
              lobbyInactive: true,
            });
          }

          if (el.lobby_owner) {
            data.push({
              id: "deleteLobby",
              lobbyDelete: true,
            });
          } else {
            data.push({
              id: "leaveLobby",
              leaveLobby: true,
            });
          }

          return {
            title: el.lobby_name,
            owner: el.lobby_owner,
            lobbyID: el.lobby_id,
            data: data,
          };
        });

        setItems({ displayText: "", items: items });
      });
  }

  async function deleteLobby(lobbyID) {
    let token = await loadJWT("jwtKey");
    let res = await axios.post(
      `${restAPIURL}/api/lobby/delete`,
      { lobbyID: lobbyID },
      {
        headers: {
          Authorization: "Bearer " + token, //the token is a variable which holds the token
        },
      }
    );

    if (res.data.message) {
      let arr = items.items.filter((item) => item.lobbyID != lobbyID);
      if (arr.length == 0) {
        setItems({ displayText: "No Lobbies found", items: arr });
        return;
      }
      setItems({ displayText: "", items: arr });
    }
  }

  async function leaveLobby(lobbyID) {
    let token = await loadJWT("jwtKey");
    let res = await axios.post(
      `${restAPIURL}/api/lobby/leave`,
      { lobbyID: lobbyID },
      {
        headers: {
          Authorization: "Bearer " + token, //the token is a variable which holds the token
        },
      }
    );

    if (res.data.message) {
      let arr = items.items.filter((item) => item.lobbyID != lobbyID);
      if (arr.length == 0) {
        setItems({ displayText: "No Lobbies found", items: arr });
        return;
      }
      setItems({ displayText: "", items: arr });
    }
  }

  async function trackDriver(userID, lobbyID, title) {
    if (trackingInterval.lobbyID != null) return;
    let token = await loadJWT("jwtKey");
    loadLobbies();
    trackingInterval.lobbyID = lobbyID;
    trackingInterval.userID = userID;
    trackingInterval.interval = setInterval(async () => {
      let { data } = await axios.post(
        `${restAPIURL}/api/tracker/checkDrowsy`,
        { lobbyID: lobbyID },
        {
          headers: {
            Authorization: "Bearer " + token, //the token is a variable which holds the token
          },
        }
      );

      let res = await axios.get(`${restAPIURL}/api/user/data`, {
        headers: {
          Authorization: "Bearer " + token, //the token is a variable which holds the token
        },
      });

      if (data.alert_drowsy) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: `${res.data.user.username} is drowsy in ${title} lobby`,
            body: `Longitude: ${data.longitude}, Latitude: ${data.latitude}`,
            sound: true,
          },
          trigger: null,
        });

        trackingInterval.lobbyID = null;
        trackingInterval.userID = null;
        clearInterval(trackingInterval.interval);
        loadLobbies();
      }
    }, 30000);
  }

  async function stopTrackingDriver() {
    loadLobbies();
    trackingInterval.lobbyID = null;
    trackingInterval.userID = null;
    clearInterval(trackingInterval.interval);
  }

  let loading;

  if (items.items.length == 0) {
    loading = (
      <View>
        <View style={styles.titleButtons}>
          <Text style={styles.pageTitle}>Lobbies</Text>
          <View style={{ marginBottom: 10 }}>
            <Button
              color="coral"
              title="Create/join lobby"
              onPress={() => {
                navigation.navigate({
                  name: "NewLobbyForm",
                  params: { userID: 3 },
                });
              }}
            />
          </View>
          <Button
            color="blue"
            title="Refresh"
            onPress={() => {
              setItems({ displayText: "~ Loading lobbies ~", items: [] });
              loadLobbies();
            }}
          />
        </View>
        <Text style={styles.pageTitle}>{items.displayText}</Text>
      </View>
    );
  } else {
    loading = (
      <View style={styles.titleButtons}>
        <Text style={styles.pageTitle}>Lobbies</Text>
        <View style={{ marginBottom: 10 }}>
          <Button
            color="coral"
            title="Create/join lobby"
            onPress={() => {
              navigation.navigate({
                name: "NewLobbyForm",
                params: { userID: 3 },
              });
            }}
          />
        </View>
        <Button
          color="blue"
          title="Refresh"
          onPress={() => {
            loadLobbies();
          }}
        />
      </View>
    );
  }

  const Item = ({ item, section }) => {
    if (item.count) {
      return (
        <View style={styles.mainButtons}>
          <Text style={styles.title}>Number of members: {item.count}</Text>
          <Text selectable={true} style={styles.title}>
            Unique join code:{" "}
            <Text style={{ fontWeight: "bold" }}>{item.joinCode}</Text>{" "}
          </Text>
          <Button
            color="coral"
            title="Show members"
            onPress={() =>
              navigation.navigate({
                name: "Members",
                params: { lobbyID: section.lobbyID, userID: userData.id },
              })
            }
          />
        </View>
      );
    } else if (item.lobbyActive) {
      if (item.userIDTracking == userData.id) {
        return (
          <View style={styles.mainButtons}>
            <Button
              title={"Currently occupying lobby \n\nuse or vacate"}
              onPress={() =>
                navigation.navigate({
                  name: "Driver",
                  params: { lobbyID: section.lobbyID, occupiedID: userData.id },
                })
              }
            />
          </View>
        );
      }
      if (!item.lobbyTracking) {
        return (
          <View style={styles.mainButtons}>
            <Button
              title="Track existing driver"
              onPress={() =>
                trackDriver(item.userIDTracking, section.lobbyID, section.title)
              }
            />
          </View>
        );
      } else {
        return (
          <View style={styles.mainButtons}>
            <Button
              title="Stop tracking"
              onPress={() =>
                stopTrackingDriver(item.userIDTracking, section.lobbyID)
              }
            />
          </View>
        );
      }
    } else if (item.lobbyInactive) {
      return (
        <View style={styles.mainButtons}>
          <Button
            color="green"
            title="Become a driver"
            onPress={() =>
              navigation.navigate({
                name: "Driver",
                params: { lobbyID: section.lobbyID },
              })
            }
          />
        </View>
      );
    } else if (item.lobbyDelete) {
      return (
        <View style={styles.mainButtons}>
          <Button
            color="darkred"
            title="Delete lobby"
            onPress={() => deleteLobby(section.lobbyID)}
          />
        </View>
      );
    } else if (item.leaveLobby) {
      return (
        <View style={styles.mainButtons}>
          <Button
            color="darkred"
            title="Leave lobby"
            onPress={() => leaveLobby(section.lobbyID)}
          />
        </View>
      );
    } else {
      return <View></View>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading}
      <SectionList
        sections={items.items}
        keyExtractor={(item, index) => item.id + index}
        renderItem={({ item, section }) => (
          <Item item={item} section={section} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.header}>{title}</Text>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    marginHorizontal: 16,
  },
  mainButtons: {
    backgroundColor: "#008F6D",
    padding: 12,
  },
  titleButtons: {
    backgroundColor: "red",
    padding: 12,
  },
  item: {
    backgroundColor: "#008F6D",
    padding: 10,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  header: {
    paddingLeft: 13,
    backgroundColor: "#008F6D",
    marginTop: 20,
    color: "white",
    padding: 8,
    fontSize: 30,
    textAlign: "center",
    fontWeight: "bold",
  },
  title: {
    color: "azure",
    fontSize: 19,
    textAlign: "center",
    marginBottom: 10,
  },
  secondaryButtons: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 30,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 3,
    color: "white",
  },
});
