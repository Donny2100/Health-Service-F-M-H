import React, { Component } from 'react';
import {
	Text,
	View,
	ScrollView,
	Image,
	Button,
	ListView,
	TextInput,
	TouchableOpacity,
	KeyboardAvoidingView,
	Picker,
	Platform,
	StyleSheet,
	AsyncStorage
} from 'react-native';
import styles from './../auth/login.style';
import { Fumi } from "react-native-textinput-effects";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, db, storage } from '../../helpers/firebase';
import Modal from 'react-native-simple-modal';
var { GooglePlacesAutocomplete } = require('react-native-google-places-autocomplete');
import { NavigationActions } from 'react-navigation'
import _ from 'lodash'
import MultiSelect from './react-native-multiple-select';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import StarRatingBar from 'react-native-star-rating-view/StarRatingBar'
import LoadingSpinnerOverlay from 'react-native-smart-loading-spinner-overlay'
import Menu, {
	MenuContext,
	MenuTrigger,
	MenuOptions,
	MenuOption,
	renderers
} from 'react-native-popup-menu';


const Item = Picker.Item;
const { SlideInMenu } = renderers;

export default class Customer extends Component {
	static navigationOptions = ({ navigation }) => {
		console.log(navigation)
		return {
			header: null,
			headerStyle: { backgroundColor: 'mediumseagreen' },
			headerTintColor: 'white',
			headerTitleStyle: { fontSize: 20 },
			title: "Results",
		}
	}

	constructor(props) {
		super(props);
		this.state = {
			searchmodal: false,
			category: [],
			categories: [],
			dataSource: new ListView.DataSource({
				rowHasChanged: (row1, row2) => row1 !== row2,
			}),
			businessdata: [],
			searchdata: [],
			searchtext: "",
			searchlocation: "",
			resMsg: "There is no result"
		};

		db.ref('/Services').once('value', (snapshot) => {
			if (snapshot.exists()) {
				categories = snapshot.val();
				this.setState({
					categories: categories,
				});
			}
		});
		db.ref('/User').orderByChild("usertype").equalTo("business").on("value", (snapshot) => {
			if (snapshot.val()) {
				res = snapshot.val()
				res = _.filter(res, {})
				console.log(res)
				this.setState({
					businessdata: res,
					searchdata: res,
					dataSource: this.state.dataSource.cloneWithRows(res),
					resMsg: Object.keys(res).length + " Matches Found"
				});
			}
		})
		console.log(this.state)
	}

	onValueChange(key, value) {
		console.log(key, value)
	};

	componentDidMount() {
	}

	componentWillUnmount() {
		console.log("willunmount")
		db.ref('/User').orderByChild("usertype").equalTo("business").off()
	}

	selectedItem = selectedItems => {
		// do something with selectedItems
		this.setState({
			category: selectedItems
		})
		console.log(selectedItems);
	};

	search() {
		console.log(this.state.searchtext)
		let searchText = this.state.searchtext.toUpperCase()
		let searchLocation = this.state.searchlocation.toUpperCase()
		let searchCategory = this.state.category
		console.log(searchText, searchLocation, searchCategory)
		this.setState({ modalOpen: false })
		let res = this.state.businessdata
		console.log(res)
		if (searchText != "") {
			var arySearchText = searchText.split(' ')
			res = _.filter(res, (business) => {
				for (i in arySearchText) {
					sear = arySearchText[i]
					if (business.description != undefined && business.description.toUpperCase().indexOf(sear) != -1 ||
						business.userName != undefined && business.userName.toUpperCase().indexOf(sear) != -1)
						return true;
					if (business.services != undefined) {
						for (i = 0; i < business.services.length; i++) {
							service = business.services[i]
							if (service.description != undefined && service.description.toUpperCase().indexOf(sear) != -1)
								return true;
						}
					}
				}
			})
		}
		console.log(res)

		if (searchLocation != "") {
			res = _.filter(res, (business) => {
				console.log(business)
				if (business.location != undefined && business.location != "" &&
					(business.location.toUpperCase().indexOf(searchLocation) != -1 || searchLocation.indexOf(business.location.toUpperCase()) != -1))
					return true;
			})
		}
		console.log(res)

		if (searchCategory.length > 0) {
			console.log(searchCategory)
			res = _.filter(res, (business) => {
				console.log(business)
				for (i in searchCategory) {
					cate = searchCategory[i].name
					console.log(cate)
					searchcate = _.filter(business.category, { 'name': cate })
					if (searchcate.length > 0) return true;

					if (business.services != undefined) {
						for (i = 0; i < business.services.length; i++) {
							service = business.services[i]
							console.log(service)
							if (service.category != undefined) {
								searchcate = _.filter(business.category, { 'name': cate })
								if (searchcate.length > 0) return true;
							}
						}
					}
				}
			})
		}
		console.log(res)

		this.state.searchdata = res
		if (res.length > 0) {
			this.setState({
				resMsg: res.length + " Matches Found"
			})
		} else {
			this.setState({
				resMsg: "There is no result"
			})
		}

		this.setState({
			searchdata: res,
			dataSource: this.state.dataSource.cloneWithRows(res)
		})
		console.log(res)
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
		return (
			<MenuContext style={{ flex: 1 }}>
				<View style={{ height: (Platform.OS === 'ios')?63:58, paddingTop: (Platform.OS=='ios')?10:3, flexDirection: 'row', alignItems: 'center', backgroundColor: 'mediumseagreen' }}>
					<Text style={[{ flex: 1, textAlign:(Platform.OS=='ios')?'center':'auto', marginLeft: 20, fontSize: 20, color: 'white', fontWeight: 'bold', }]}>{(Platform.OS=='ios')?'                        ':''}Results</Text>
					<Icon name="wechat" size={25} color="white" style={{ padding: 5, paddingRight: 10 }} onPress={() => {
						console.log("detail page")
						this.props.navigation.navigate('ChatList')
					}} />
					<Icon name="search" size={25} color="white" style={{ padding: 5, paddingRight: 10 }} onPress={() => {
						console.log("bell")
						let newState = true;
						if (this.state.modalOpen != undefined)
							newState = !this.state.modalOpen;
						this.setState({ modalOpen: newState })
					}} />
					<View style={[stylesmenu.topbar, { backgroundColor: 'mediumseagreen' }]}>
						<Menu onSelect={() => {
							this.logout()
						}}>
							<MenuTrigger style={stylesmenu.menuTrigger}>
								<Text style={[stylesmenu.menuTriggerText, { textAlign: 'right' }]}>&#8942;</Text>
							</MenuTrigger>
							<MenuOptions customStyles={optionsStyles}>
								<MenuOption customStyles={optionStyles}>
									<Text style={{ textAlign: 'right', color: '#333', width: 80, fontSize: 18 }}>Log Out</Text>
								</MenuOption>
							</MenuOptions>
						</Menu>
					</View>
				</View>
				<View style={{ flex: 1, backgroundColor: '#f2fbf5' }} contentContainerStyle={{ flex: 1 }}
				>
					{/*For input text*/}
					<ScrollView style={[styles.card2, { padding: 12 }]}>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<View>
								<Text style={styles.searchResult}>{this.state.resMsg}</Text>
							</View>
							<TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}
								onPress={() => {
									console.log("resultsmap")
									if (this.state.searchdata.length > 0)
										this.props.navigation.navigate('ResultsMap', { info: this.state.searchdata })
								}
								}>
								<View style={[styles.logoutbutton, { borderRadius: 4, marginRight: 0, padding: 10, backgroundColor: "seagreen" }]}>
									<Text numberOfLines={1} style={{ fontSize: 15, color: 'white' }}>Show Results on Map</Text>
								</View>
							</TouchableOpacity>
						</View>
						<ListView
							dataSource={this.state.dataSource}
							renderRow={this.renderService.bind(this)}
							style={[styles.listView, { backgroundColor: '#f2fbf5' }]}
						/>
						<View style={{ height: 14 }} />
					</ScrollView>
					<Modal
						offset={this.state.offset}
						open={this.state.modalOpen != undefined && this.state.modalOpen}
						modalDidOpen={() => undefined}
						modalDidClose={() => this.setState({ modalOpen: false })}
						closeOnTouchOutside={true}
						style={{ backgroundColor: '#f2fbf5', alignItems: 'center', width: 100 }}
					>
						<KeyboardAwareScrollView style={{ backgroundColor: '#f2fbf5' }}
						>
							<Fumi
								style={[styles.input, { height: 70 }]}
								labelStyle={{ color: '#aaa' }}
								label={'Search Term'}
								iconClass={FontAwesomeIcon}
								iconName={'search'}
								inputStyle={{ color: 'green' }}
								iconColor={'green'}
								value={this.state.searchtext}
								onChangeText={(searchtext) => this.setState({ searchtext })}
							/>
							<View style={[styles.input, { backgroundColor: 'white', flexDirection: 'row', height: 130 }]}>
								<Icon name="map-marker" size={20} color="gray" style={[styles.eachIcon, { marginTop: 5, marginLeft: 10 }]} />
								<GooglePlacesAutocomplete
									placeholder='Search Location'
									minLength={2} // minimum length of text to search 
									autoFocus={false}
									listViewDisplayed='auto'    // true/false/undefined 
									fetchDetails={true}
									renderDescription={(row) => row.description} // custom description render 
									onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true 
										this.setState({ searchlocation: data.description })
										console.log(this.state);
									}}
									textInputProps={{
										onChangeText: (text) => {
											console.log(text)
											this.setState({ searchlocation: text })
										}
									}}
									getDefaultValue={() => {
										return this.state.searchlocation; // text input default value 
									}}
									query={{
										// available options: https://developers.google.com/places/web-service/autocomplete 
										key: 'AIzaSyCE4KH1OBhtrpiIAGQmjea8XkhP6fqu0nU',
										language: 'en', // language of the results 
										types: '(cities)', // default: 'geocode' 
									}}
									styles={{
										textInputContainer: {
											height: 50,
											backgroundColor: 'rgba(0,0,0,0)',
											borderTopWidth: 0,
											borderBottomWidth: 0,
										},
										textInput: {
											marginTop: 0,
											marginLeft: 0,
											marginRight: 0,
											height: 50,
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
							<View style={[styles.input, { backgroundColor: 'white', flexDirection: 'row', height: 200 }]}>
								<View style={{ flexDirection: 'row', marginLeft: 10 }}>
									<Icon name="key" size={20} color="gray" style={[styles.eachIcon, { marginTop: 12 }]} />
								</View>
								<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, marginRight: 12, height: 130 }}
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
										height={180}
										searchInputStyle={{ fontFamily: 'ProximaNova-Regular', color: 'green' }} />
								</View>
							</View>
							<View style={{ marginTop: 4 }} />
							<Button
								style={styles.button}
								onPress={() => this.search()}
								title="Search"
								color="green"
							/>
						</KeyboardAwareScrollView>
					</Modal>

				</View>
			</MenuContext>
		)
	}

	renderService(business) {
		return (
			<TouchableOpacity style={[styles.reslistcontainer, { marginBottom: 12, padding: 6 }]} onPress={() => {
				console.log("detail page")
				this.props.navigation.navigate('ViewBusiness', { info: business, usertype: 'customer' })
			}}>
				<View style={{ height: 30, flexDirection: 'row', alignItems: 'center' }}>
					<View style={{ flex: 3, flexDirection: 'row', marginLeft: 10 }}>
						<Text numberOfLines={1} style={{ fontSize: 18, color: 'black' }}>{business.userName}</Text>
					</View>
					<View style={{ flex: 2, flexDirection: 'row', justifyContent: 'flex-end', height: 30 }}>
						<StarRatingBar
							starStyle={{
								width: 15,
								height: 15,
							}}
							readOnly={true}
							continuous={true}
							score={(business.avgScore != undefined) ? business.avgScore : 0}
							spacing={3}
							allowsHalfStars={true}
							accurateHalfStars={true}
							onStarValueChanged={(score) => this.setState({ score })}
						/>
					</View>
				</View>
				<View style={{ height: 30, flexDirection: 'row', alignItems: 'center' }}>
					<View style={{ flex: 3, flexDirection: 'row', marginLeft: 10 }}>
						<Icon name="map-marker" size={20} color="gray" />
						<Text>{business.location}</Text>
					</View>
					<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
						<Text>{}</Text>
					</View>
				</View>
				<View style={{ height: 150, flexDirection: 'row' }}>
					<Image
						source={{ uri: business.imageUrl }}
						resizeMode="stretch"
						style={{ flex: 1 }}
					/>
				</View>
			</TouchableOpacity>
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
