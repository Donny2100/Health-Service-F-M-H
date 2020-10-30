import React, { Component } from 'react';
import {
	Text,
	View,
	ScrollView,
	Image,
	Button,
	ListView,
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
import StarRatingBar from 'react-native-star-rating-view/StarRatingBar'

export default class ResultsMap extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerStyle: { backgroundColor: 'mediumseagreen' },
			headerTintColor:'white',
			headerTitleStyle: {fontSize:20},
			title: "Map",
			headerRight:
			<View style={{ padding:10, flexDirection: 'row' }}>
				<Icon name="search" size={25} color="white" style={{ padding: 5, paddingRight: 10 }} onPress={() => {
					console.log("search")
				}} />
			</View>
		}
	}

	constructor(props) {
		super(props);

		const { params } = this.props.navigation.state;
		console.log(params)
		let initial = false
		if (params.info.length > 0) {
			for (i in params.info) {
				if (params.info[i].lat != undefined && params.info[i].lng != undefined) {
					this.state = {
						businessInfo: params.info,
						lat: params.info[i].lat,
						lng: params.info[i].lng,
					}
					initial = true
					break
				}
			}
		}
		if (!initial)
			this.state = {
				businessInfo: params.info,
				lat: 37.78825,
				lng: -122.4324
			}
	}

	componentDidMount() {
	}

	componentWillUnmount() {
	}

	render() {
		return (
			<MapView
				style={styles.fullmap}
				region={{
					latitude: this.state.lat,
					longitude: this.state.lng,
					latitudeDelta: 0.0015,
					longitudeDelta: 0.00121,
				}}
			>
				{this.state.businessInfo.map((info, i) => {
					console.log(this.state)
					console.log(info.lat, info.lng)
					if (info.lat != undefined && info.lng != undefined) {
						return <MapView.Marker
							key={i}
							coordinate={{
								latitude: info.lat,
								longitude: info.lng
							}}
							title={info.userName}
							description={info.description}
						>
								<MapView.Callout>
									<View style={{ width:350, height: 100, flexDirection: 'row', alignItems: 'center' }}>
										<View style={{ width: 110, alignItems:'center' }}>
											<View style={{ width: 100, height: 100, alignItems:'center' }} >
												<Image source={{ uri: info.imageUrl }} style={{ width: 100, height: 100 }} />
											</View>
										</View>
										<View style={{ flex: 1, marginLeft: 10 }}>
											<View style={{ flex: 1, marginTop: 0, flexDirection:'row', alignItems:'center' }}>
												<Text numberOfLines={1} style={{ flex:3, color:'black', fontSize: 18 }}>{ info.userName }</Text>
												<View style={{ marginLeft: 14 }} />
												<Text numberOfLines={1} style={{ flex:1, color:'red', fontSize: 13, textAlign:'right' }}>0.4KM</Text>
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
													score={(info.avgScore != undefined) ? info.avgScore : 0}
													allowsHalfStars={true}
													accurateHalfStars={true}
												/>
											</View>
											<View style={{ flex: 1, marginTop: 5 }}>
												<Text numberOfLines={1} style={{ color: 'gray', fontSize: 15 }}>{ info.location }</Text>
											</View>
										</View>
									</View>
								</MapView.Callout>
							</MapView.Marker>

					}
				})}





			</MapView>
		)
	}
}