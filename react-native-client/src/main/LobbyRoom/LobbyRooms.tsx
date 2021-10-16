import React, {Component} from "react";
import { StyleSheet, Text, View, SafeAreaView, SectionList, StatusBar, Button, BackHandler} from "react-native";
import {LobbyRoomState} from './LobbyRoom.dto'

import { useNavigation } from '@react-navigation/native';


export default class LobbyRoom extends Component {
  
   state: LobbyRoomState = {
     refresh: false,
     items: [
      {
        title: "LobbyName test 1",
        owner: false,
        lobbyID: 3,
        data: [
          {
            id: "numberOfMembers",
            count: 10
          },
          {
            id: "lobbyActive",
            userIDTracking: 3,
            lobbyActive: true
          },
          {
            id: "deleteLobby",
            lobbyDelete: true
          }
        ]
      },
      {
        title: "LobbyName test 2",
        lobbyID: 4,
        owner: true,
        data: [
          {
            id: "numberOfMembers",
            count: 13
          },
          {
            id: "lobbyInactive",
            lobbyInactive: true
          },
          {
            id: "leaveLobby",
            leaveLobby: true
          }
        ]
      },
    ]

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
    borderRadius: 10
  },
  item: {
    backgroundColor: "#008F6D",
    padding: 10,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 10
  },
  header: {
    paddingLeft: 13,
    backgroundColor: "#008F6D",
    marginTop: 20,
    color: "white",
    padding: 8,
    fontSize: 23,
    borderRadius: 10
  },
  title: {
    color: "azure",
    fontSize: 19,
    textDecorationLine: 'underline',
    marginBottom: 10
  },
  secondaryButtons: {
    padding: 20
  }
});
