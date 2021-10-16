import React, { useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView, SectionList, StatusBar, Button } from "react-native";
import { FlatList } from "react-native-gesture-handler";

let driving= 3;

export default function LobbyMembers({route}) {

    const [Items, setItems] = React.useState([
        {id: "1", user: "Yokek344"},
        {id: "2", user: "Yokek554"},
        {id: "3", user: "Lmaoo3444"}

    ])

    useEffect(()=> {
      console.log(route.params?.lobbyID);
    })

    async function removeUser(id){

    }
      
    let currentlyDrivingComponent;
 
    return (
      
      <SafeAreaView style={styles.container}>
        <View>
        <Text>Members:  </Text>
        </View>
        <FlatList
          data={Items}
          renderItem={({item}) => {
            if(route.params.owner) {
              currentlyDrivingComponent = null
              if(item.id == driving) currentlyDrivingComponent = <Text>Currently driving</Text>;
              return (
                <View style={styles.item}>
                  <Text style={styles.title}>{item.user}</Text>
                  <Button color="darkred" title="Remove User" onPress={() => removeUser(item.id)}/>
                  {currentlyDrivingComponent}
                </View>
              )
            }else {
              currentlyDrivingComponent = null
              if(item.id == driving) currentlyDrivingComponent = <Text>Currently driving</Text>;
              return (
                <View style={styles.item}>
                  <Text style={styles.title}>{item.user}</Text>
                  {currentlyDrivingComponent}
                </View>
              )
            }
          }}
        />
      </SafeAreaView>
    );
        
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: StatusBar.currentHeight,
      marginHorizontal: 16
    },
    item: {
      backgroundColor: "#f9c2ff",
      padding: 20,
      marginVertical: 8
    },
    header: {
      fontSize: 32,
      backgroundColor: "#fff"
    },
    title: {
      fontSize: 24
    }
  });