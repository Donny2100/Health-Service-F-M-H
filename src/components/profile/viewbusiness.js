import React, { Component } from 'react';
import {
	Text,
	View,
	ScrollView,
	Image,
	Button,
	Linking,
	ListView,
	TouchableOpacity,
	TextInput
} from 'react-native';
import styles from './../auth/login.style';
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, db, storage } from '../../helpers/firebase';
import LoadingSpinnerOverlay from 'react-native-smart-loading-spinner-overlay'
import TimerEnhance from 'react-native-smart-timer-enhance'
import { NavigationActions } from 'react-navigation'
import MapView from 'react-native-maps';
import Share from 'react-native-share';
import StarRatingBar from 'react-native-star-rating-view/StarRatingBar'
import Modal from 'react-native-simple-modal';
import { Fumi } from "react-native-textinput-effects";

export default class ViewBusiness extends Component {
	static navigationOptions = ({ navigation }) => {
		const { params } = navigation.state;
		return {
			headerStyle: { backgroundColor: 'mediumseagreen', overflow: 'hidden' },
			headerTintColor: 'white',
			title: navigation.state.params.info.userName,
			headerTitleStyle: { width:200, fontSize: 20, overflow: 'hidden' },
			headerRight:
			(params.usertype == "customer") &&
			<View style={{ overflow: 'visible', padding: 10, flexDirection: 'row' }}>
				<Icon name="user-plus" size={25} color="white" style={{ padding: 5, paddingRight: 15 }} onPress={() => {
					navigation.setParams({ navChat: true })
				}} />
				<Icon name="share-alt" size={25} color="white" style={{ padding: 5, paddingRight: 15 }} onPress={() => {
					console.log("share")
					console.log(params.info)
					let url = "http://"
					if (params.info.website != undefined) {
						url = params.info.website
						if (!(url.startsWith("http") && url.startsWith("http")))
							url = "http://" + url
					}

					console.log(url)
					let shareOptions = {
						title: "FMS Share",
						message: "I want to share with you:" + params.info.userName,
						url: url,
						subject: "FMS Share"
					};
					console.log(shareOptions)
					Share.open(shareOptions).catch((err) => { err && console.log(err); })

				}} />
				<Icon name="star-o" size={25} color="white" style={{ padding: 5, paddingRight: 10 }} onPress={() => {
					console.log("star")
					console.log("bell")
					let newState = true;
					console.log(navigation.state.params)
					if (navigation.state.params != undefined)
						newState = !navigation.state.params.modalOpen;
					console.log(navigation.state.params)
					console.log(newState)
					navigation.setParams({ modalOpen: newState })
				}} />
			</View>
		}
	}

	constructor(props) {
		super(props);

		const { params } = this.props.navigation.state;
		console.log(params.info.rating)
		latitude = (params.info.lat != undefined) ? params.info.lat : ((params.info.postlat != undefined) ? params.info.postlat : 37.78825)
		longitude = (params.info.lng != undefined) ? params.info.lng : ((params.info.postlng != undefined) ? params.info.postlng : -122.4324)
		console.log(latitude, longitude)
		let marker = {
			'key': '1',
			'title': 'hello',
			'coordinates': {
				latitude: latitude,
				longitude: longitude
			}
		};

		this.state = {
			businessInfo: params.info,
			dataSource: new ListView.DataSource({
				rowHasChanged: (row1, row2) => row1 !== row2,
			}),
			marker: marker,
			latitude: latitude,
			longitude: longitude,
			score: (params.info.rating != undefined && Object.keys(params.info.rating).indexOf(auth.currentUser.uid) != -1) ? params.info.rating[auth.currentUser.uid].score : 5,
			commentText: (params.info.rating != undefined && Object.keys(params.info.rating).indexOf(auth.currentUser.uid) != -1) ? params.info.rating[auth.currentUser.uid].comment : ""
		};
		console.log(params.info.location)
	}

	componentDidMount() {
		console.log("componentdidmount")
		if (this.state.businessInfo.services != undefined) {
			this.setState({
				dataSource: this.state.dataSource.cloneWithRows(this.state.businessInfo.services)
			})
		}
	}

	componentWillUnmount() {
	}

	saveRating() {
		console.log("save rating")
		this.props.navigation.setParams({ modalOpen: false })
		console.log(this.state.commentText)
		console.log(this.state.score)
		let rating = {
			comment: this.state.commentText,
			score: this.state.score
		}
		let toalScore = 0, avgScore = 0
		if (this.state.businessInfo.rating == undefined) {
			totalScore = this.state.score
			avgScore = this.state.score
		} else if (Object.keys(this.state.businessInfo.rating).indexOf(auth.currentUser.uid) != -1) {
			oldMyScore = this.state.businessInfo.rating[auth.currentUser.uid].score
			totalScore = this.state.businessInfo.totalScore + this.state.score - oldMyScore
			avgScore = (totalScore / Object.keys(this.state.businessInfo.rating).length).toFixed(1)
		} else {
			totalScore = this.state.businessInfo.totalScore + this.state.score
			avgScore = (totalScore / (Object.keys(this.state.businessInfo.rating).length + 1)).toFixed(1)
		}

		console.log("aaaa")
		db.ref('/User/' + this.state.businessInfo.id).child("rating/" + auth.currentUser.uid).set(rating, (error) => {
			if (error) {
				console.log("error", error)
			} else {
				console.log("Rating saved successfully")
			}
		})
		console.log(totalScore, avgScore)
		db.ref('/User/' + this.state.businessInfo.id).child("totalScore").set(totalScore, (error) => {
			if (error) {
				console.log("error", error)
			} else {
				console.log("Rating saved successfully")
			}
		})
		avgScore = Number(avgScore)
		db.ref('/User/' + this.state.businessInfo.id).child("avgScore").set(avgScore, (error) => {
			if (error) {
				console.log("error", error)
			} else {
				console.log("Rating saved successfully")
			}
		})
		console.log(this.state.businessInfo.rating)
		// let avgscore = this.state.score
		// db.ref('/User/' + this.state.businessInfo.id).child("avgscore").set(avgscore, (error) => {
		// 	if (error) {
		// 		console.log("error", error)
		// 	} else {
		// 		console.log("Rating saved successfully")
		// 	}
		// })

	}

	gotoChat() {
		user = auth.currentUser;
		db.ref("/User/" + user.uid + "/contacts").orderByChild("contactid").equalTo(this.state.businessInfo.id).once("value", (snapshot) => {
			console.log(snapshot);
			console.log(snapshot.val());
			if (!snapshot.exists()) {
				let newcontact1 = {contactid: this.state.businessInfo.id};
				db.ref('/User').child(user.uid + "/contacts").push(newcontact1);
				let newcontact2 = {contactid: user.uid};
				db.ref('/User').child(this.state.businessInfo.id + "/contacts").push(newcontact2);
			}
		});
		this.props.navigation.setParams({ navChat: false })
		this.props.navigation.navigate('ChatDetail', { info: this.state.businessInfo });
	}

	capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	render() {
		console.log(this.props.navigation.state.params.navChat)
		if (this.props.navigation.state.params != undefined && this.props.navigation.state.params.navChat == true) {
			this.gotoChat()
		}

		return (
			<View style={{ flex:1, backgroundColor: '#f2fbf5' }}>
				<ScrollView style={{ backgroundColor: '#f2fbf5' }} contentContainerStyle={{ justifyContent: 'center' }}>
					<View style={[styles.card2, { paddingTop: 0, paddingLeft: 0, paddingRight: 0 }]}>
						<Image
							source={{ uri: this.state.businessInfo.imageUrl }}
							style={[styles.image, { marginTop: 0 }]}
						/>
						<View style={{ flexDirection: 'row', marginTop: 4, paddingLeft: 15, paddingRight: 15 }}>
							<Text style={[styles.titleservice, { textAlign: "left", justifyContent: "flex-start", color: "black", marginTop: 4, fontSize: 16 }]}>{(this.state.businessInfo.avgScore != undefined) ? this.state.businessInfo.avgScore : 0} stars</Text>
							<View style={{ flexDirection: 'row', marginLeft: 7 }} />
							<StarRatingBar
								starStyle={{
									width: 15,
									height: 15,
								}}
								readOnly={true}
								continuous={true}
								spacing={3}
								score={(this.state.businessInfo.avgScore != undefined) ? this.state.businessInfo.avgScore : 0}
								allowsHalfStars={true}
								accurateHalfStars={true}
							/>
						</View>
						<View style={{ marginTop: 14 }}>
							<Text style={[styles.titleservice, { fontSize: 16, textAlign: "left", justifyContent: "flex-start", color: "black", paddingLeft: 15, paddingRight: 15 }]}>Description</Text>
							<Text style={{ backgroundColor: "white", paddingLeft: 13, paddingRight: 13 }}>{this.state.businessInfo.description}</Text>
						</View>
						<View style={{ marginTop: 14 }}>
							<Text style={[styles.titleservice, { fontSize: 16, color: "black" }]}>Products and Services</Text>
							<ScrollView
								horizontal={true}
								contentContainerStyle={{ justifyContent: 'center' }}>
								<ListView
									horizontal={true}
									showsHorizontalScrollIndicator={false}
									scrollEnabled={true}
									dataSource={this.state.dataSource}
									renderRow={this.renderService.bind(this)}
									style={[styles.collistView, { padding: 0, margin: 0 }]}
								/>
							</ScrollView>
						</View>
						<View style={{ flex: 1, flexDirection: 'row', marginTop: 14, height: 220 }}>
							<MapView
								style={styles.map}
								region={{
									latitude: this.state.latitude,
									longitude: this.state.longitude,
									latitudeDelta: 0.0015,
									longitudeDelta: 0.00121,
								}}
							>
								<MapView.Marker
									key={this.state.marker.key}
									coordinate={this.state.marker.coordinates}
									title={this.state.marker.title}
								>
									<MapView.Callout>
										<View style={{ width: 350, height: 100, flexDirection: 'row', alignItems: 'center' }}>
											<View style={{ width: 110, alignItems: 'center' }}>
												<View style={{ width: 100, height: 100, alignItems: 'center' }} >
													<Image source={{ uri: this.state.businessInfo.imageUrl }} style={{ width: 100, height: 100 }} />
												</View>
											</View>
											<View style={{ flex: 1, marginLeft: 10 }}>
												<View style={{ flex: 1, marginTop: 0, flexDirection: 'row', alignItems: 'center' }}>
													<Text numberOfLines={1} style={{ flex: 3, color: 'black', fontSize: 18 }}>{this.state.businessInfo.userName}</Text>
													<View style={{ marginLeft: 14 }} />
													<Text numberOfLines={1} style={{ flex: 1, color: 'red', fontSize: 13 }}>0.4KM</Text>
												</View>
												<View style={{ flex: 1, marginTop: 5, flexDirection: 'row' }}>
													<Text numberOfLines={1} style={{ color: 'gray', fontSize: 15, marginTop: 3 }}>(British)</Text>
													<View style={{ marginLeft: 14 }} />
													<StarRatingBar
														starStyle={{
															width: 15,
															height: 15,
														}}
														readOnly={true}
														continuous={true}
														spacing={5}
														score={(this.state.businessInfo.avgScore != undefined) ? this.state.businessInfo.avgScore : 0}
														allowsHalfStars={true}
														accurateHalfStars={true}
													/>
												</View>
												<View style={{ flex: 1, marginTop: 5, flexDirection: 'row' }}>
													<Icon name="map-marker" size={20} color="gray" />
													<View style={{ marginLeft: 4 }} />
													<Text numberOfLines={1} style={{ color: 'gray', fontSize: 15 }}>{this.state.businessInfo.location}</Text>
												</View>
											</View>
										</View>
									</MapView.Callout>
								</MapView.Marker>
							</MapView>
						</View>
						<View style={{ marginTop: 8 }}>
							<TouchableOpacity
								onPress={() => {
									Linking.canOpenURL("http://" + this.state.businessInfo.website).then(supported => {
										if (supported) {
											Linking.openURL("http://" + this.state.businessInfo.website);
										} else {
											console.log('Don\'t know how to open URI: ' + this.state.businessInfo.website);
										}
									});
								}}>
								<Text style={[styles.titleservice, { textDecorationLine:'underline', fontSize: 16, color: "green" }]}>{this.state.businessInfo.website}</Text>
							</TouchableOpacity>
						</View>
					</View>
					{this.props.navigation.state.params != undefined && this.props.navigation.state.params.usertype == "customer" &&
					<View style={[styles.card2, {paddingTop:0}]}>
						<Button
							style={styles.button}
							onPress={() => this.gotoChat()}
							title="Chat"
							color="green"
						/>
						<View style={{ marginTop: 4 }} />
					</View> }
				</ScrollView>
				<Modal
					offset={0}
					open={this.props.navigation.state.params != undefined && this.props.navigation.state.params.modalOpen}
					modalDidOpen={() => undefined}
					modalDidClose={() => this.props.navigation.setParams({ modalOpen: false })}
					closeOnTouchOutside={true}
					style={{ backgroundColor: '#f2fbf5', alignItems: 'center', flex: 1 }}
				>
					<View style={{ backgroundColor: '#f2fbf5' }}>
						<Fumi
							style={styles.input}
							labelStyle={{ color: '#aaa' }}
							label={'Comment'}
							iconClass={FontAwesomeIcon}
							iconName={'comment-o'}
							inputStyle={{ color: 'green' }}
							iconColor={'green'}
							value={this.state.commentText}
							onChangeText={(commentText) => this.setState({ commentText })}
						/>
						<View style={[{ flexDirection: 'row', height: 50, justifyContent: 'center', alignItems: 'center' }]}>
							<StarRatingBar
								starStyle={{
									width: 30,
									height: 30,
								}}
								readOnly={false}
								score={this.state.score}
								onStarValueChanged={(score) => this.setState({ score })}
							/>
						</View>
						<View style={{ marginTop: 4 }} />
						<Button
							style={styles.button}
							onPress={() => this.saveRating()}
							title="Save"
							color="green"
						/>
					</View>
				</Modal>
			</View >

		)
	}

	renderService(serviceinfo) {
		return (
			<View style={[styles.collistcontainer, { width: 135, margin: 0, padding: 0 }]}>
				<View style={[styles.leftContainer, { width: 120, height: 100 }]}>
					<Image
						resizeMode="stretch"
						source={{ uri: serviceinfo.serviceImage }}
						style={[styles.thumbnail, { width: 120, height: 100 }]}
					/>
				</View>
				<View style={styles.rightContainer}>
					<Text numberOfLines={1} style={[styles.titleservice, { marginBottom:0, fontSize: 14 }]}>{this.capitalizeFirstLetter(serviceinfo.description)}</Text>
					<Text style={[styles.year, { fontSize: 12 }]}>Price £{serviceinfo.price}</Text>
				</View>
			</View>
		);
	}

}