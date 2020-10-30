import React, { Component } from 'react';
import {
	Text,
	View,
	ScrollView,
	Image,
	Button,
	ListView,
	Platform,
	Picker,
	AsyncStorage,
	TouchableHighlight,
	TouchableOpacity,
	BackHandler,
	StyleSheet,
	TextInput,
} from 'react-native';
import styles from './../auth/login.style';
import { Fumi } from "react-native-textinput-effects";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, db, storage } from '../../helpers/firebase';
import RNFetchBlob from 'react-native-fetch-blob'
import LoadingSpinnerOverlay from 'react-native-smart-loading-spinner-overlay'
import TimerEnhance from 'react-native-smart-timer-enhance'
var { GooglePlacesAutocomplete } = require('react-native-google-places-autocomplete');
import { NavigationActions } from 'react-navigation'
import MultiSelect from './react-native-multiple-select';
import Modal from 'react-native-simple-modal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Geocoder from 'react-native-geocoder';
import Menu, {
	MenuContext,
	MenuTrigger,
	MenuOptions,
	MenuOption,
	renderers
} from 'react-native-popup-menu';


const Item = Picker.Item;
const { SlideInMenu } = renderers;

var ImagePicker = require('react-native-image-picker');
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

const uploadImage = (uri, mime = 'application/octet-stream') => {
	return new Promise((resolve, reject) => {
		console.log(uri)
		const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
		const sessionId = new Date().getTime()
		let uploadBlob = null
		const imageRef = storage.ref('images').child(`${sessionId}`)
		console.log(uri)

		fs.readFile(uploadUri, 'base64')
			.then((data) => {
				console.log("data");
				let res1 = Blob.build(data, { type: `${mime};BASE64` })
				console.log(res1)
				return res1
			})
			.then((blob) => {
				console.log("blob");
				uploadBlob = blob
				let res2 = imageRef.put(blob, { contentType: mime })
				console.log(res2)
				return res2
			})
			.then(() => {
				uploadBlob.close()
				console.log("close", imageRef.getDownloadURL());
				return imageRef.getDownloadURL()
			})
			.then((url) => {
				console.log("url", url);
				resolve(url)
			})
			.catch((error) => {
				console.log("error", error);
				reject(error)
			})
	})
}

export default class Profile extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			header: null,
			headerStyle: { backgroundColor: 'mediumseagreen' },
			headerTintColor: 'white',
			headerTitleStyle: { fontSize: 20 },
			title: "Edit your profile",
		}
	}

	constructor(props) {
		super(props);
		this.state = {
			userName: "",
			mobileNumber: "",
			website: "",
			description: "",
			postcode: "",
			location: "",
			response: "",
			dataSource: new ListView.DataSource({
				rowHasChanged: (row1, row2) => row1 !== row2,
			}),
			categories: [],
			category: [],
			services: [],
			loaded: false,
			loaded1: false,
			photoSrcModalVisible: false
		};

		// servic = [{
		// 	id: 0,
		// 	name: "head"
		// }, {
		// 	id: 1,
		// 	name: "legs"
		// }, {
		// 	id: 2,
		// 	name: "feet"
		// }, {
		// 	id: 3,
		// 	name: "arms"
		// }, {
		// 	id: 4,
		// 	name: "chest"
		// }, {
		// 	id: 5,
		// 	name: "massage"
		// }, {
		// 	id: 6,
		// 	name: "oil"
		// }, {
		// 	id: 7,
		// 	name: "medicine"
		// }, {
		// 	id: 8,
		// 	name: "candle"
		// }]

		// db.ref('/Services').set(servic)

		db.ref('/Services').once('value', (snapshot) => {
			if (snapshot.exists()) {
				categories = snapshot.val()
				console.log(categories)
				this.setState({
					categories: categories,
					loaded1: true
				});
			}
		});

		this.saveProfile = this.saveProfile.bind(this);
		this.cancel = this.cancel.bind(this);
		this.imagePick = this.imagePick.bind(this);
		//this.logout = this.logout.bind(this);
	}

	componentDidMount() {
		let user = auth.currentUser;
		db.ref('/User').child(user.uid).on('value', (snapshot) => {
			console.log(snapshot)
			if (snapshot.exists()) {
				let userinfo = snapshot.val();
				this.setState({
					businessInfo: userinfo
				})
				console.log(userinfo)
				if (userinfo.services != undefined) {
					console.log(this.state)
					this.setState({
						services: userinfo.services,
						dataSource: this.state.dataSource.cloneWithRows(userinfo.services)
					})
				};
				console.log(this.state)
				this.setState({
					userName: (userinfo.userName == undefined) ? null : userinfo.userName,
					mobileNumber: (userinfo.mobileNumber == undefined) ? null : userinfo.mobileNumber,
					website: (userinfo.website == undefined) ? null : userinfo.website,
					description: (userinfo.description == undefined) ? null : userinfo.description,
					postcode: (userinfo.postcode == undefined) ? null : userinfo.postcode,
					location: (userinfo.location == undefined) ? null : userinfo.location,
					lat: (userinfo.lat == undefined) ? null : userinfo.lat,
					lng: (userinfo.lng == undefined) ? null : userinfo.lng,
					postlat: (userinfo.postlat == undefined) ? null : userinfo.postlat,
					postlng: (userinfo.postlng == undefined) ? null : userinfo.postlng,
					imageUrl: userinfo.imageUrl,
					category: (userinfo.category == undefined) ? [] : userinfo.category,
					services: (userinfo.services == undefined) ? [] : userinfo.services,
					loaded: true
				})
				console.log(this.state)
			}
		});

		if (!this.state.loaded || !this.state.loaded1)
			this._modalLoadingSpinnerOverLay.show()
	}

	componentWillUnmount() {
		console.log("willunmount")
		let user = auth.currentUser;
		console.log(user)
		if (user != undefined) db.ref('/User').child(user.uid).off()
	}

	selectedItem = selectedItems => {
		// do something with selectedItems
		this.setState({
			category: selectedItems,
			modalOpen: false,
		})
	};

	imagePick() {
		var options = {
			title: 'Select an Image',
			storageOptions: {
				skipBackup: true,
				path: 'images'
			},
			takePhotoButtonTitle: null
		};
		ImagePicker.showImagePicker(options, (response) => {
			console.log('Response = ', response);

			if (response.didCancel) {
				console.log('User cancelled image picker');
			}
			else if (response.error) {
				console.log('ImagePicker Error: ', response.error);
			}
			else if (response.customButton) {
				console.log('User tapped custom button: ', response.customButton);
			}
			else {
				this.setState({ imageUrl: response.uri })
			}
		});
	}

	async savePro(url) {
		console.log(this.state.category)
		let user = auth.currentUser;
		let userProfile = {
			userName: this.state.userName,
			mobileNumber: this.state.mobileNumber,
			website: this.state.website,
			description: this.state.description,
			postcode: this.state.postcode,
			location: this.state.location,
			lat: this.state.lat,
			lng: this.state.lng,
			category: this.state.category,
			usertype: "business",
			services: this.state.services,
			email: user.email,
			id: user.uid
		}

		try {
			console.log(this.state.postcode)
			const res = await Geocoder.geocodeAddress(this.state.postcode);
			console.log(res)
			if (res.length > 0) {
				userProfile.postlat = res[0].position.lat
				userProfile.postlng = res[0].position.lng
			}
		}
		catch (err) {
			console.log(err);
		}

		if (url != undefined) userProfile.imageUrl = url;

		db.ref('/User/' + user.uid).update(userProfile, (error) => {
			if (error) {
				this.setState({
					response: error
				});
			} else {
				this.setState({
					response: "Profile changed successfully"
				});
			}
		})
	}

	async saveProfile() {
		// if (user.email != email)
		// 	user.updateEmail(email);
		if (this.state.imageUrl == undefined || !this.state.imageUrl.startsWith("content://") && !this.state.imageUrl.startsWith("file://")) {
			this.savePro(this.state.imageUrl)
			return
		}
		uploadImage(this.state.imageUrl)
			.then(url => {
				this.savePro(url)
			})
			.catch(error => console.log(error))

	}

	async cancel() {
	}

	async logout() {
		console.log("logout")
		user = auth.currentUser
		db.ref('/User').child(user.uid).off()
		auth.signOut().then(async () => {
			console.log("navigation")
			await AsyncStorage.removeItem("email");
			await AsyncStorage.removeItem("password");
			this._navigateTo('Home')
		}).catch((error) => {
			console.log(error)
		});
	}

	_navigateTo = (routeName) => {
		const actionToDispatch = NavigationActions.reset({
			index: 0,
			actions: [NavigationActions.navigate({ routeName })]
		})
		this.props.navigation.dispatch(actionToDispatch)
	}

	render() {
		if (this.props.navigation.state.params != undefined && this.props.navigation.state.params.logoutFlag) {
			this.logout()
			return (
				<LoadingSpinnerOverlay
					ref={component => this._modalLoadingSpinnerOverLay = component} />
			)
		}

		if (!this.state.loaded || !this.state.loaded)
			return (
				<LoadingSpinnerOverlay
					ref={component => this._modalLoadingSpinnerOverLay = component} />
			)

		return (
			<MenuContext style={{ flex: 1 }}>
				<View style={{ height: (Platform.OS=='ios')?63:58, paddingTop: (Platform.OS=='ios')?10:3, flexDirection: 'row', alignItems: 'center', backgroundColor: 'mediumseagreen' }}>
					<Text style={[{ flex:1, textAlign:(Platform.OS=='ios')?'center':'auto', marginLeft: 20, fontSize: 20, color: 'white', fontWeight: 'bold', }]}>{(Platform.OS=='ios')?'        ':''}Edit your profile</Text>
					<Icon name="wechat" size={25} color="white" style={{ padding: 5, paddingRight: 10 }} onPress={() => {
						this.props.navigation.navigate('ChatList')
					}} />
					<View style={[stylesmenu.topbar, { backgroundColor: 'mediumseagreen' }]}>
						<Menu onSelect={(value) => {
								if (value == 1)
									this.logout()
								else if (value == 2)
									this.props.navigation.navigate('ViewBusiness', { info: this.state.businessInfo, usertype: 'business' })
								console.log(value)
							}}>
							<MenuTrigger style={stylesmenu.menuTrigger}>
								<Text style={[stylesmenu.menuTriggerText, { textAlign: 'right' }]}>&#8942;</Text>
							</MenuTrigger>
							<MenuOptions customStyles={optionsStyles}>
								<MenuOption customStyles={optionStyles} value={1}>
									<Text style={{ textAlign: 'right', color:'#333', width: 80, fontSize: 18 }}>Log Out</Text>
								</MenuOption>
								<MenuOption customStyles={optionStyles} value={2}>
									<Text style={{ textAlign: 'right', color:'#333', width: 80, fontSize: 18 }}>Preview</Text>
								</MenuOption>
							</MenuOptions>
						</Menu>
					</View>
				</View>
				<View style={{ backgroundColor: '#f2fbf5' }}>
					<ScrollView
						contentContainerStyle={{ justifyContent: 'center' }}
					>

						{/*For input text*/}
						<View style={styles.card2}>
							<View style={styles.logoContainer}>
								<Image source={require('../../resources/images/fmh_logo.png')} />
							</View>
							<Fumi
								style={styles.input}
								labelStyle={{ color: '#aaa' }}
								label={'Business Name'}
								iconClass={FontAwesomeIcon}
								iconName={'user'}
								inputStyle={{ color: 'green' }}
								iconColor={'green'}
								value={this.state.userName}
								onChangeText={(userName) => this.setState({ userName })}
							/>
							<Fumi
								style={styles.input}
								labelStyle={{ color: '#aaa' }}
								label={'Mobile'}
								iconClass={FontAwesomeIcon}
								iconName={'mobile'}
								keyboardType='numeric'
								inputStyle={{ color: 'green' }}
								iconColor={'green'}
								value={this.state.mobileNumber}
								onChangeText={(mobileNumber) => this.setState({ mobileNumber })}
							/>
							<Fumi
								style={styles.input}
								labelStyle={{ color: '#aaa' }}
								label={'Website'}
								iconClass={FontAwesomeIcon}
								iconName={'globe'}
								inputStyle={{ color: 'green' }}
								iconColor={'green'}
								value={this.state.website}
								onChangeText={(website) => this.setState({ website })}
							/>
							<Fumi
								style={[styles.input]}
								labelStyle={{ color: '#aaa' }}
								label={'Description'}
								iconClass={FontAwesomeIcon}
								iconName={'pencil'}
								inputStyle={{ color: 'green' }}
								iconColor={'green'}
								value={this.state.description}
								onChangeText={(description) => this.setState({ description })}
							/>
							<Fumi
								style={styles.input}
								labelStyle={{ color: '#aaa' }}
								label={'PostCode'}
								iconClass={FontAwesomeIcon}
								iconName={'address-card-o'}
								inputStyle={{ color: 'green' }}
								iconColor={'green'}
								value={this.state.postcode}
								onChangeText={(postcode) => this.setState({ postcode })}
							/>
							<View style={{ backgroundColor: 'white', flexDirection: 'row', borderColor: '#d6d7da', borderWidth: 1, borderRadius: 4, marginTop: 4 }}>
								<Icon name="map-marker" size={20} color="gray" style={[styles.eachIcon, { marginTop: 18, marginLeft: 10 }]} />
								<GooglePlacesAutocomplete
									placeholder='Search Location'
									minLength={2} // minimum length of text to search 
									autoFocus={false}
									listViewDisplayed='true'    // true/false/undefined 
									fetchDetails={true}
									renderDescription={(row) => row.description} // custom description render 
									onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true 
										console.log(data, details)
										this.setState({
											location: data.description,
											lat: details.geometry.location.lat,
											lng: details.geometry.location.lng
										})
										console.log(this.state);
									}}
									textInputProps={{
										onChangeText: (text) => {
											this.setState({
												location: text,
												lat: null,
												lng: null
											})
										}
									}}
									getDefaultValue={() => {
										console.log(this.state)
										return this.state.location; // text input default value 
									}}
									query={{
										// available options: https://developers.google.com/places/web-service/autocomplete 
										key: 'AIzaSyCE4KH1OBhtrpiIAGQmjea8XkhP6fqu0nU',
										language: 'en', // language of the results 
										types: '(cities)', // default: 'geocode' 
									}}
									styles={{
										textInputContainer: {
											height: 70,
											backgroundColor: 'rgba(0,0,0,0)',
											borderTopWidth: 0,
											borderBottomWidth: 0,
										},
										textInput: {
											marginLeft: 0,
											marginRight: 0,
											height: 60,
											color: 'green',
											fontSize: 18,
										},
										description: {
											fontWeight: 'bold',
										},
										predefinedPlacesDescription: {
											color: '#1faadb',
										},
									}}

									nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch 
									GoogleReverseGeocodingQuery={{
										// available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro 
									}}
									GooglePlacesSearchQuery={{
										// available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search 
										rankby: 'distance',
										types: 'food',
									}}


									filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities 

									debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms. 
								/>
							</View>
							<View style={{ marginTop: 4 }} />
							<TouchableOpacity
								onPress={() => this.setState({ modalOpen: true })}
								style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', height: 70, borderWidth: 1, borderColor: '#d6d7da', borderRadius: 4 }}
							>
								<Icon name="key" size={20} color="gray" style={[styles.eachIcon, { marginLeft: 10 }]} />
								<Text style={{ color: '#aaa', fontSize: 18 }}>Select Keyword</Text>
							</TouchableOpacity>
							<View style={{ marginTop: 4 }} />
							<Image
								source={{ uri: this.state.imageUrl }}
								style={styles.image}
							/>
							<View style={{ marginTop: 4 }} />
							<Button style={styles.button}
								onPress={this.imagePick}
								title="Upload Business Image"
								color="steelblue"
							/>
						</View>

						<View style={styles.card2}>
							<Button
								style={styles.button}
								onPress={() => this.props.navigation.navigate('Services')}
								title="Products and Services"
								color="green"
							/>
							<View style={{ marginTop: 4 }} />
							<ScrollView
								horizontal={true}
								contentContainerStyle={{ justifyContent: 'center' }}>
								<ListView
									horizontal={true}
									showsHorizontalScrollIndicator={false}
									scrollEnabled={true}
									dataSource={this.state.dataSource}
									renderRow={this.renderService.bind(this)}
									style={styles.collistView}
								/>
							</ScrollView>
						</View>

						{/*For response*/}
						<View>
							<Text style={styles.response}>{this.state.response}</Text>
						</View>

						{/*For Button*/}
						<View style={styles.profilesubmit}>
							<Button
								style={styles.button}
								onPress={this.saveProfile}
								title="  Save  "
								color="green"
							/>
							<View style={{ width: 80 }}>
							</View>
							<Button style={styles.button}
								onPress={() => this.logout()}
								title="Cancel"
								color="green"
							/>
						</View>
					</ScrollView>
					<Modal
						offset={this.state.offset}
						open={this.state.modalOpen}
						modalDidOpen={() => undefined}
						modalDidClose={() => this.setState({ modalOpen: false })}
						closeOnTouchOutside={true}
						style={{ backgroundColor: '#f2fbf5', alignItems: 'center', width: 100 }}
					>
						<KeyboardAwareScrollView style={{ backgroundColor: '#f2fbf5' }}>
							<View style={[styles.input, { backgroundColor: 'white', flexDirection: 'row', height: 300 }]}>
								<View style={{ flexDirection: 'row' }}>
									<Icon name="key" size={20} color="gray" style={[styles.eachIcon, { marginTop: 12 }]} />
								</View>
								<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, marginRight: 12, height: 230 }}
								>
									<MultiSelect
										items={this.state.categories}
										uniqueKey="id"
										selectedItemsChange={this.selectedItem}
										selectedItems={this.state.category}
										selectText="Select Keywords"
										searchInputPlaceholderText="Search Items..."
										fontFamily="ProximaNova-Regular"
										altFontFamily="ProximaNova-Light"
										tagRemoveIconColor="coral"
										tagBorderColor="green"
										tagTextColor="green"
										selectedItemFontFamily="ProximaNova-Semibold"
										selectedItemTextColor="blue"
										selectedItemIconColor="blue"
										itemFontFamily="ProximaNova-Regular"
										itemTextColor="#000"
										height={280}
										searchInputStyle={{ fontFamily: 'ProximaNova-Regular', color: 'green' }} />
								</View>
							</View>
						</KeyboardAwareScrollView>
					</Modal>
				</View>
			</MenuContext>
		)
	}

	renderService(serviceinfo) {
		return (
			<View style={styles.collistcontainer}>
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
			</View>
		);
	}

}

const optionStyles = {
	optionText: {
		color: 'black',
	},
};

const optionsStyles = {
	optionsContainer: {
		backgroundColor: 'mediumseagreen',
		alignItems: 'flex-end',
		width: 120
	},
	optionsWrapper: {
		backgroundColor: 'white',
		width: 120
	},
	optionWrapper: {
		backgroundColor: 'white',
		margin: 5,
	},
	optionTouchable: {
		underlayColor: 'white',
		activeOpacity: 70,
	},
	optionText: {
		color: 'white',
	},
};

const stylesmenu = StyleSheet.create({
	topbar: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		backgroundColor: 'black',
		paddingHorizontal: 5,
		paddingVertical: 10
	},
	menuTrigger: {
		paddingHorizontal: 10
	},
	menuTriggerText: {
		color: 'white',
		fontWeight: '600',
		fontSize: 25
	},
});
