import React, { Component } from 'react';
import {
	Text,
	View,
	ScrollView,
	Image,
	Button,
	Platform,
	Picker,
	Alert,
	BackHandler,
	TextInput
} from 'react-native';
import styles from './../auth/login.style';
import { Fumi } from "react-native-textinput-effects";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, db, storage } from '../../helpers/firebase';
import RNFetchBlob from 'react-native-fetch-blob'
import LoadingSpinnerOverlay from 'react-native-smart-loading-spinner-overlay'
import TimerEnhance from 'react-native-smart-timer-enhance'
import MultiSelect from './react-native-multiple-select';
import { HeaderBackButton } from 'react-navigation'

const Item = Picker.Item;

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

export default class RegisterService extends Component {
	static navigationOptions = ({ navigation, goBack }) => {
		return {
			headerStyle: { backgroundColor: 'mediumseagreen' },
			headerTintColor:'white',
			headerTitleStyle: {fontSize:20},
			title: "Register a new Service",
			headerLeft: 
//				<Icon name={'chevron-left'} onPress={ () => {  } }  />
				<HeaderBackButton onPress={() => navigation.setParams({ exitRegister: true })} tintColor='white' />
		}
	}

	constructor(props) {
		super(props);
		const { params } = this.props.navigation.state;

		if (params == undefined) {
			this.state = {
				categories: [],
				response: "",
				description: "",
				category: [],
				price: "",
				registration: true,
			};
		} else {
			this.state = {
				categories: [],
				response: "",
				description: params.info.description,
				price: params.info.price,
				category: (params.info.category == undefined) ? [] : params.info.category,
				serviceImage: params.info.serviceImage,
				curid: params.info.id,
				registration: false,
			};
		}

		this.saveService = this.saveService.bind(this);
		this.cancel = this.cancel.bind(this);
		this.imagePick = this.imagePick.bind(this);
	}

	selectedItem = selectedItems => {
		// do something with selectedItems
		this.setState({
			category: selectedItems
		})
		console.log(selectedItems);
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
				this.setState({ serviceImage: response.uri })
			}
		});
	}

	savePro(url) {
		let services = [];
		let user = auth.currentUser;
		console.log("111")
		db.ref('/User').child(user.uid + "/services").once('value', (snapshot) => {
			console.log("333")
			let services = []
			if (snapshot.exists())
				services = snapshot.val();
			console.log(services)
			if (this.state.registration == false) {
				for (var i = 0; i < services.length; i++) {
					console.log(services[i])
					if (services[i].id == this.state.curid) {
						services[i] = {
							description: this.state.description,
							price: Number(this.state.price),
							category: this.state.category,
							id: this.state.curid
						}
						console.log("444")
						if (url != undefined) services[i].serviceImage = url;
						console.log(services[i])
						break
					}
				}
				console.log(services)
			} else {
				console.log("222")
				let service = {
					description: this.state.description,
					price: Number(this.state.price),
					category: this.state.category,
					id: 0
				}
				if (url != undefined) service.serviceImage = url;
				if (services.length != 0) {
					service.id = services[services.length - 1].id + 1
				}
				services.push(service)
			}
			db.ref('/User').child(user.uid + "/services").set(services)
			console.log("goBack")
			this.props.navigation.goBack()
		});
	}

	backPress = () => {
		this.exitRegister()
		return true
	}

	componentDidMount() {
		BackHandler.addEventListener("hardwareBackPress", this.backPress)

		db.ref('/Services').once('value', (snapshot) => {
			if (snapshot.exists()) {
				categories = snapshot.val()
				console.log(categories)
				this.setState({
					categories: categories,
				});
			}
		});
		console.log(this.state)
	}

	componentWillUnmount() {
		BackHandler.removeEventListener("hardwareBackPress", this.backPress)
	}

	exitRegister() {
		console.log("exitregister")
		const { params } = this.props.navigation.state;
		let dirty = true;
		console.log(this.state)
		if (this.state.registration == false && params.info.description == this.state.description && params.info.price == this.state.price && 
			params.info.serviceImage == this.state.serviceImage)
			dirty = false;

		if (this.state.registration == true && this.state.description == "" && this.state.price == "" && 
			this.state.category.length == 0 && (this.state.serviceImage == undefined || this.state.serviceImage == ""))
			dirty = false;
		
		console.log(dirty)
		if (dirty == true) {
			console.log('alert')
			Alert.alert(
				'Do you want to exit without saving data?',
				'',
				[
					{ text: 'Yes', onPress: () => this.props.navigation.goBack() },
					{ text: 'No', onPress: () => {
						console.log('ok pressed')
						this.saveService()
					} },
				]
			)
		} else
			this.props.navigation.goBack()
	}



	async saveService() {
		this._modalLoadingSpinnerOverLay.show()
		if (this.state.serviceImage == undefined || !this.state.serviceImage.startsWith("content://") && !this.state.serviceImage.startsWith("file://")) {
			this.savePro(this.state.serviceImage)
			return
		}
		uploadImage(this.state.serviceImage)
			.then(url => {
				this.savePro(url)
				return
			})
			.catch(error => console.log(error))

	}

	async cancel() {
	}

	render() {
		if (this.props.navigation.state.params != undefined && this.props.navigation.state.params.exitRegister) {
			console.log("kkkkkkkkkkkkkkkkkkkkkkkk")
			this.exitRegister()

		}
		// if (!this.state.saving) {
		// 	return this.renderSavingView();
		// }
		return (
			<View style={{backgroundColor:'#f2fbf5'}}
				onStartShouldSetResponderCapture={() => {
					this.setState({ enableScrollViewScroll: true });
					return false;
				}}
			>
				<ScrollView
					contentContainerStyle={{ justifyContent: 'center' }}
					scrollEnabled={this.state.enableScrollViewScroll}
				>
				{/*For input text*/}
				<View style={styles.card2}>
					<View style={styles.logoContainer}>
						<Image source={require('../../resources/images/fmh_logo.png')} />
					</View>
					<Fumi
						style={[styles.input]}
						labelStyle={{ color: '#aaa' }}
						label={'Service Name'}
						iconClass={FontAwesomeIcon}
						iconName={'pencil'}
						inputStyle={{ color: 'green' }}
						iconColor={'green'}
						value={this.state.description}
						onChangeText={(description) => this.setState({ description })}
					/>
					<View style={[styles.input, { backgroundColor: 'white', flexDirection: 'row', height: 300 }]}>
						<View style={{ flexDirection: 'row' }}>
							<Icon name="key" size={20} color="gray" style={[styles.eachIcon, { marginTop: 12 }]} />
						</View>
						<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, marginRight: 12, height: 230 }}
								onStartShouldSetResponderCapture={() => {
									this.setState({ enableScrollViewScroll: false });
									{/*if (this.refs.myList.scrollProperties.offset === 0 && this.state.enableScrollViewScroll === false) {
										this.setState({ enableScrollViewScroll: true });
									}*/}
									return false;
								}}
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
					<Fumi
						style={styles.input}
						keyboardType='numeric'
						labelStyle={{ color: '#aaa' }}
						label={'Price(£)'}
						iconClass={FontAwesomeIcon}
						iconName={'gbp'}
						inputStyle={{ color: 'green' }}
						iconColor={'green'}
						value={this.state.price.toString()}
						onChangeText={(price) => this.setState({ price })}
					/>
					<Image
						resizeMode="stretch"
						source={{ uri: this.state.serviceImage }}
						style={styles.image}
					/>
					<View style={{ marginTop: 4 }} />
					<Button style={styles.button}
						onPress={this.imagePick}
						title="Upload Service Image"
						color="steelblue"
					/>
				</View>

				{/*For response*/}
				<View>
					<Text style={styles.response}>{this.state.response}</Text>
				</View>

				{/*For Button*/}
				<View style={styles.profilesubmit}>
					<Button
						style={styles.button}
						onPress={this.saveService}
						title="Register"
						color="green"
					/>
				</View>
				<LoadingSpinnerOverlay
					ref={component => this._modalLoadingSpinnerOverLay = component} />

			</ScrollView>
			</View>
		)
	}
}