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
	Alert
} from 'react-native';
import styles from './../auth/login.style';
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, db, storage } from '../../helpers/firebase';
import RNFetchBlob from 'react-native-fetch-blob'

export default class Services extends Component {
	static navigationOptions = ({
		headerStyle: { backgroundColor: 'mediumseagreen' },
		headerTintColor:'white',
		headerTitleStyle: {fontSize:20},
		title: "Products and Services"
	})

	constructor(props) {
		super(props);
		this.state = {
			userName: "",
			mobileNumber: "",
			website: "",
			description: "",
			price: "",
			postcode: "",
			location: "",
			response: "",
			dataSource: new ListView.DataSource({
				rowHasChanged: (row1, row2) => row1 !== row2,
			}),
			services: []
		};
	}

	componentDidMount() {
		// BackHandler.addEventListener("hardwareBackPress", () => {
		// 	console.log(this.props.navigation)
		// 	this.props.navigation.goBack()
		// 	return true
		// })
		let services = [];
		let user = auth.currentUser;
		db.ref('/User').child(user.uid + "/services").on('value', (snapshot) => {
			if (snapshot.exists()) {
				services = snapshot.val();
				console.log(services);
				this.setState({
					services: services,
					dataSource: this.state.dataSource.cloneWithRows(services),
				});
			}
		});
	}

	componentWillUnmount() {
		let user = auth.currentUser;
		db.ref('/User').child(user.uid + "/services").off()
	}

	async editService(serviceinfo) {
		console.log(serviceinfo)
		this.props.navigation.navigate('RegisterService', {info:serviceinfo})
	}

	async deleteService(serviceinfo) {
		Alert.alert(
			'Do you want to delete really?',
			'',
			[
				{ text: 'Cancel', onPress: () => console.log('Cancel Pressed!') },
				{ text: 'OK', onPress: () => {
					console.log(serviceinfo)
					console.log(this.state.services)
					services = this.state.services
					for (var idx in services) {
						if (services[idx].id == serviceinfo.id) this.state.services.splice(idx, 1)
					}
					this.setState({
						services: services,
						dataSource: this.state.dataSource.cloneWithRows(services),
					});
					let user = auth.currentUser;
					db.ref('/User').child(user.uid + "/services").set(services)
					console.log(this.state.services)
				} },
			]
		)
	}

	render() {
		return (
			<ScrollView  style={{backgroundColor:'#f2fbf5'}} contentContainerStyle={{ justifyContent: 'center' }}>
				{/*For input text*/}
				<View style={styles.card2}>
					<View style={styles.logoContainer}>
						<Image source={require('../../resources/images/fmh_logo.png')} />
					</View>
					<ListView
						dataSource={this.state.dataSource}
						renderRow={this.renderService.bind(this)}
						style={styles.listView}
					/>
					<View style={{ marginTop: 4 }} />
					<Button
						style={styles.button}
						onPress={() => this.props.navigation.navigate('RegisterService')}
						title="Register a new Service"
						color="green"
					/>
				</View>
			</ScrollView>
		)
	}

	renderService(serviceinfo) {
		return (
			<View style={styles.listcontainer}>
				<View style={styles.leftContainer}>
					<Image
						resizeMode="stretch"
						source={{ uri: serviceinfo.serviceImage }}
						style={styles.thumbnail}
					/>
				</View>
				<View style={styles.rightContainer}>
					<Text numberOfLines={1} style={styles.titleservice}>{serviceinfo.description}</Text>
					<Text style={styles.year}>£{serviceinfo.price}</Text>
				</View>
				<View style={styles.buttonContainer}>
					<Button
						style={styles.button}
						onPress={this.editService.bind(this, serviceinfo)}
						title="Edit"
						color="green"
					/>
					<Button
						style={styles.button}
						onPress={this.deleteService.bind(this, serviceinfo)}
						title="Delete"
						color="red"
					/>
				</View>

			</View>
		);
	}

}