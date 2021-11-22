import React, { useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView, SectionList, StatusBar, Button } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import {restAPIURL} from '../../../env'
import axios from 'axios'

let driving= 3;

export default function LobbyMembers({route}) {

    // const [Items, setItems] = React.useState([
    //     {id: "1", user: "Yokek344"},
    //     {id: "2", user: "Yokek554"},
    //     {id: "3", user: "Lmaoo3444"}

    // ])
    const [Items, setItems] = React.useState([])
    const [init, setInit] = React.useState(false)

    // const fetchUser = async () => {
    //   const url = `http://localhost:3002/api/lobby/members`;
    //   const response = await axios.get(url);
    //   console.log(response.data);
    // };

    async function loadMembers(){
      let items = []
      let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.BhcT-kWzUAwZzQ55XGnUpGZKuMf2dlWL3u9jvgfhWss"
      axios.get(`${restAPIURL}/api/lobby/members?lobbyID=${route.params?.lobbyID}`, {
        headers: {
          Authorization: 'Bearer ' + token //the token is a variable which holds the token
        }
        })
        .then((res) => {

          if(res.data.length == 0) return;

          driving = res.data[0].user_tracking

          items = res.data.map((el) => {

            return {
              id: el.id,
              user: el.username
            }

          })

          setItems(items)
        })
    }

    useEffect(()=> {
      loadMembers()
    }, [])

    async function removeUser(lobbyID, userID){
      let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.BhcT-kWzUAwZzQ55XGnUpGZKuMf2dlWL3u9jvgfhWss"
      let res = await axios.post(`${restAPIURL}/api/lobby/remove`, {lobbyID: lobbyID, userID: userID},{
          headers: {
            Authorization: 'Bearer ' + token //the token is a variable which holds the token
          }
      })

      loadMembers()


    }
      
    let currentlyDrivingComponent;
    let flatList;

    if(Items.length > 0){
      flatList = (
        <View>
          <View style={styles.item}>
            <Text style={styles.title}>Members:</Text>
          </View>
          <FlatList
            data={Items}
            renderItem={({item}) => {
              if(route.params.owner != item.id) {
                currentlyDrivingComponent = null
                if(item.id == driving) currentlyDrivingComponent = <Text>Currently driving</Text>;
                return (
                  <View style={styles.item}>
                    <Text style={styles.title}>{item.user}</Text>
                    <Button color="darkred" title="Remove Member" onPress={() => removeUser(route.params?.lobbyID, item.id)}/>
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
        </View>
      )
    }else {
      flatList = (
        <View style={styles.item}>
          <Text style={styles.title}>~ Loading Members ~</Text>
        </View>
      )
    }
 
    return (
      
      <SafeAreaView style={styles.container}>
        {flatList}
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
      backgroundColor: "#008F6D",
      padding: 20,
      marginVertical: 8
    },
    header: {
      fontSize: 32,
      backgroundColor: "#fff"
    },
    title: {
      textAlign: 'center',
      fontSize: 24,
      color: 'white',
      fontWeight: 'bold'
    },
  });