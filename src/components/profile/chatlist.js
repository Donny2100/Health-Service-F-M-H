import React, { Component } from 'react';
import {
	Text,
	View,
	ScrollView,
	Image,
	Button,
	ListView,
	TextInput,
	Platform,
	BackHandler,
	FlatList,
	TouchableOpacity,
	Alert
} from 'react-native';
import styles from './../auth/login.style';
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, db, storage } from '../../helpers/firebase';
import RNFetchBlob from 'react-native-fetch-blob'
import async from 'async'

export default class ChatList extends Component {
	static navigationOptions = ({
		headerStyle: { backgroundColor: 'mediumseagreen' },
		headerTintColor: 'white',
		headerTitleStyle: { fontSize: 20 },
		title: "Chat list"
	})

	constructor(props) {
		super(props);
		this.state = {
			data: []
		};
	}

	componentDidMount() {
		// BackHandler.addEventListener("hardwareBackPress", () => {
		// 	console.log(this.props.navigation)
		// 	this.props.navigation.goBack()
		// 	return true
		// })
		let user = auth.currentUser;
		let contacts = []
		db.ref("/User/" + user.uid + "/contacts").once("value", (snapshot) => {
			console.log(snapshot);
			console.log(snapshot.val());
			if (snapshot.exists()) {
				var aryuser = [];
				async.forEach(snapshot.val(), (contact, callback) => {
					db.ref("/User/" + contact.contactid).once("value", (snapshot) => {
						console.log(snapshot.val());
						if (snapshot.exists()) {
							let contactuser = snapshot.val();
							roomid = contactuser.id + '-' + user.uid;
							if (contactuser.usertype == "customer") roomid = user.uid + '-' + contactuser.id;
							console.log(roomid)
							//aryuser[roomid] = contactuser
							db.ref("/Chat/" + roomid).child('summary').once("value", (snapshot) => {
								console.log(contactuser)
								if (snapshot.exists()) {
									summary = snapshot.val()
									if (summary.user._id != user.uid) {
										var dt = new Date(summary.createdAt)
										var dtmin = '' + dt.getMinutes()
										console.log(dtmin, dtmin.length)
										dtmin = (dtmin.length < 2)?("0"+dtmin):dtmin
										console.log(dtmin)
										summary.createdAt = dt.getHours() + ":" + dtmin
										contactuser.summary = summary
									}
								}
								aryuser.push(contactuser)
								callback();
							});
								
						} else
							callback('error')
					});
				}, (err) => {
					if (err) console.log(err)
					console.log(aryuser)
					this.setState({
						data: aryuser
					})
				});
			}
		});
	}

	componentWillUnmount() {
	}

	render() {
		return (
			<ScrollView style={{ backgroundColor: '#f2fbf5' }} contentContainerStyle={{ justifyContent: 'center' }}>
				{/*For input text*/}
				<View style={{}}>
					<FlatList
						data={this.state.data}
						renderItem={({ item }) => this.renderChats(item)}
					/>
				</View>
			</ScrollView>
		)
	}

	renderChats(item) {
		return (
			<TouchableOpacity style={[styles.reslistcontainer, { marginBottom: 12, padding: 6, borderWidth: 0 }]} onPress={() => {
				console.log("detail page")
				this.props.navigation.navigate('ChatDetail', { info: item })
			}}>
				<View style={{ height: 30, flexDirection: 'row', alignItems: 'center' }}>
					<View style={{ flex: 1, flexDirection: 'row', marginLeft: 20 }}>
						<Text numberOfLines={1} style={{ fontSize: 18, color: 'black' }}>{item.userName}</Text>
					</View>
				</View>
				<View style={{ height: 30, flexDirection: 'row', alignItems: 'center' }}>
					<View style={{ flex: 3, flexDirection: 'row', marginLeft: 20 }}>
						<Text>{item.summary==undefined?'':item.summary.text}</Text>
					</View>
					<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', marginRight: 20 }}>
						<Text>{item.summary==undefined?'':item.summary.createdAt}</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	}
}