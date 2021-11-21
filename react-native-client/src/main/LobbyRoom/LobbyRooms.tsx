import React, {Component} from "react";
import { StyleSheet, Text, View, SafeAreaView, SectionList, StatusBar, Button, BackHandler} from "react-native";
import {LobbyRoomState} from './LobbyRoom.dto'
import {restAPIURL} from '../../../env'
import axios from 'axios'

import { useNavigation } from '@react-navigation/native';


export default class LobbyRoom extends Component {
  
   state: LobbyRoomState = {
     refresh: false,
     items: [],

   }

   async componentDidMount(){
    let items = []
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.BhcT-kWzUAwZzQ55XGnUpGZKuMf2dlWL3u9jvgfhWss"
    axios.get(`${restAPIURL}/api/lobby/list`,{
        headers: {
          Authorization: 'Bearer ' + token //the token is a variable which holds the token
        }
      })
      .then((res) => {

        if(res.data.length == 0) return;

        items = res.data.map((el) => {

          let data: any = [{
            id: "numberOfMembers",
            count: el.member_count
          }]

          if(el.user_tracking != 0){
            data.push({
              id: "lobbyActive",
              userIDTracking: el.user_tracking,
              lobbyActive: true
            })
          }else {
            data.push({
              id: "lobbyInactive",
              lobbyInactive: true
            })
          }

          if(el.lobby_owner){
            data.push({
              id: "deleteLobby",
              lobbyDelete: true
            })
          }else {
            data.push({
              id: "leaveLobby",
              leaveLobby: true
            })
          }

          return {
            title: el.lobby_name,
            owner: el.lobby_owner,
            lobbyID: el.lobby_id,
            data: data

          }

        })

        this.setState({items: items})

      })
   }



   async trackDriver(userID) {
     console.log(userID);


    //  refresh item this.setState({refresh: !this.state.refresh})

   }

   async deleteLobby(lobbyID) {
     console.log(lobbyID);
   }

   async becomeDriver(){

   }

   async showMembers(lobbyID: number){
     console.log(lobbyID);

   }

   async leaveLobby(lobbyID: number){
     console.log(lobbyID);
   }

    render() {

      let loading;

      if(this.state.items.length == 0){
        loading = (
          <Text style={styles.loading}>Loading lobbies...</Text>
        )
      }else {
        loading = (
          <View style={styles.mainButtons}>
            <Text style={styles.pageTitle}>Lobbies</Text>
            <Button color="blue" title="Refresh" onPress={() => this.setState({refresh: !this.state.refresh})}/>
          </View>

        )
      }

      const Item = ({ item, section}) => {
        if(item.count){
          return (
            <View style={styles.mainButtons}>
              <Text style={styles.title}>Number of members: {item.count}</Text>
              <Button color="coral" title="Show members" onPress={() => this.props.navigation.navigate({name: "Members", params: {lobbyID: section.lobbyID, owner: section.owner}})} />
            </View>
          )
        }else if(item.lobbyActive) {
          return (
            <View style={styles.mainButtons}>
              <Button title="Track existing driver" onPress={() => this.trackDriver(item.userIDTracking)}/>
            </View>
          )
        }else if(item.lobbyInactive){
          return (
            <View style={styles.mainButtons}>
              <Button color="green" title="Become a driver" onPress={() => this.props.navigation.navigate({name: "Driver", params: {userID: 3}})}/>
            </View>
          )
        }else if (item.lobbyDelete) {
          return (
            <View style={styles.mainButtons} >
              <Button color="darkred" title="Delete lobby" onPress={() => this.deleteLobby(section.lobbyID)}/>
            </View>
          )
        }else if(item.leaveLobby){
          return (
            <View style={styles.mainButtons} >
              <Button color="darkred" title="Leave lobby" onPress={() => this.leaveLobby(section.lobbyID)}/>
            </View>
          )
        }else {
          return (
            <View></View>
          )
        }

      };

        return (
          <SafeAreaView style={styles.container}>
          {loading}
          <SectionList
            sections={this.state.items}
            extraData={this.state.refresh}
            keyExtractor={(item, index) => item.id + index}
            renderItem={( {item , section} ) => <Item item={item} section={section} />}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.header}>{title}</Text>
            )}
          />
          </SafeAreaView>
          );
    }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    marginHorizontal: 16
    
  },
  mainButtons: {
    backgroundColor: "#008F6D",
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
    textAlign: 'center',
    fontWeight: 'bold'

  },
  title: {
    color: "azure",
    fontSize: 19,
    textAlign: 'center',
    marginBottom: 10,
  },
  secondaryButtons: {
    padding: 20
  },
  loading: {
    fontSize: 24,
    color: "red"
  },
  pageTitle: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 3,
    color: 'white'
  }
});
