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
	Alert
} from 'react-native';
import styles from './../auth/login.style';
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, db, storage } from '../../helpers/firebase';
import { GiftedChat, Actions, Bubble } from 'react-native-gifted-chat';
import CustomActions from './CustomActions';
import CustomView from './CustomView';
import StarRatingBar from 'react-native-star-rating-view/StarRatingBar'
import Modal from 'react-native-simple-modal';
import { Fumi } from "react-native-textinput-effects";
import { NavigationActions } from 'react-navigation'

export default class ChatDetail extends Component {
	messagesRef = null;
	limitTime = new Date().toISOString();

	static navigationOptions = ({ navigation }) => {
		const { params } = navigation.state
		let showRating = false
		if (params.info.usertype == "business")
			showRating = true;
		console.log(showRating)

		return {
			headerStyle: { backgroundColor: 'mediumseagreen' },
			headerTintColor: 'white',
			headerTitleStyle: { fontSize: 20 },
			title: "Chat",
			headerRight:
			showRating &&
			<Icon name="star" size={25} color="white" style={{ padding: 5, paddingRight: 10 }} onPress={() => {
				console.log("star")
				let newState = true;
				console.log(navigation.state.params)
				if (navigation.state.params != undefined)
					newState = !navigation.state.params.modalOpen;
				console.log(navigation.state.params)
				console.log(newState)
				navigation.setParams({ modalOpen: newState })
			}} />
		}
	}

	constructor(props) {
		super(props);
		const { params } = this.props.navigation.state;
		console.log(params.info.rating)

		user = auth.currentUser
		var roomid = params.info.id + "-" + user.uid
		if (params.info.usertype == "customer")
			roomid = user.uid + '-' + params.info.id

		this.state = {
			myId: user.uid,
			businessInfo: params.info,
			roomid: roomid,
			refreshing: false,
			messages: [],
			loadEarlier: true,
			isLoadingEarlier: false,
			score: (params.info.rating != undefined && Object.keys(params.info.rating).indexOf(auth.currentUser.uid) != -1) ? params.info.rating[auth.currentUser.uid].score : 5,
			commentText: (params.info.rating != undefined && Object.keys(params.info.rating).indexOf(auth.currentUser.uid) != -1) ? params.info.rating[auth.currentUser.uid].comment : ""
		};
		console.log(params.info)

		this._isMounted = false;
		this.onSend = this.onSend.bind(this);
		this.renderCustomActions = this.renderCustomActions.bind(this);
		this.renderBubble = this.renderBubble.bind(this);
		this.onLoadEarlier = this.onLoadEarlier.bind(this);

		this._isAlright = null;
	}

	componentDidMount() {
		this._isMounted = true;
		user = auth.currentUser
		db.ref('/User').child(user.uid).on('value', (snapshot) => {
			console.log(snapshot)
			if (snapshot.exists()) {
				this.setState({
					myInfo: snapshot.val()
				})
			}
		});

		this.loadMessages((message) => {
			this.setState((previousState) => {
				var firstmessage = previousState.messages[previousState.messages.length - 1]
				if (firstmessage != undefined)
					this.limitTime = firstmessage.createdAt
				return {
					messages: GiftedChat.append(previousState.messages, message),
				};
			});
		});
	}

	componentWillUnmount() {
		console.log(this.messagesRef);
		this._isMounted = false;
		if (this.messagesRef) {
			this.messagesRef.off();
		}
	}

	loadMessages(callback) {
		this.messagesRef = db.ref('/Chat').child(this.state.roomid + "/body");
		this.messagesRef.off();
		const onReceive = (data) => {
			const message = data.val();
			db.ref('/Chat').child(this.state.roomid + "/summary").set({})
			console.log(message)
			callback(message);
		};
		this.messagesRef.limitToLast(20).on('child_added', onReceive);
	}

	onLoadEarlier() {
		this.setState((previousState) => {
			return {
				isLoadingEarlier: true,
			};
		});

		console.log(this.limitTime)
		this.messagesRef.orderByChild('createdAt').endAt(this.limitTime).limitToLast(20).once('value', (snapshot) => {
			if (snapshot.exists()) {
				console.log(snapshot.val())
				res = _.filter(snapshot.val(), {})
				this.limitTime = res[0].createdAt
				_.reverse(res)
				console.log(res)
				res.shift()
				if (this._isMounted === true) {
					this.setState((previousState) => {
						return {
							messages: GiftedChat.prepend(previousState.messages, res),
							loadEarlier: (res.length < 19) ? false : true,
							isLoadingEarlier: false,
						};
					});
				}
			} else {
				if (this._isMounted === true) {
					this.setState({
						loadEarlier: false,
						isLoadingEarlier: false,
					});
				}
			}
		});
	}

	onSend(messages = []) {
		console.log(messages)
		for (let i = 0; i < messages.length; i++) {
			console.log(messages[i])
			messages[i].createdAt = new Date().toISOString();
			db.ref('/Chat').child(this.state.roomid + "/body").push(messages[i]);
		}
		if (messages.length > 0)
			db.ref('/Chat').child(this.state.roomid + "/summary").set(messages[messages.length - 1]);
	}

	renderCustomActions(props) {
		return (
			<CustomActions
				{...props}
			/>
		);
	}

	renderBubble(props) {
		return (
			<Bubble
				{...props}
				wrapperStyle={{
					left: {
						backgroundColor: '#ffffff',
					},
					right: {
						backgroundColor: '#00a760',
					}
				}}
			/>
		);
	}

	renderCustomView(props) {
		return (
			<CustomView
				{...props}
			/>
		);
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

	render() {
		return (
			<View style={{ flex:1, backgroundColor: '#f2fbf5' }}>
				<GiftedChat
					messages={this.state.messages}
					onSend={this.onSend}
					loadEarlier={this.state.loadEarlier}
					onLoadEarlier={this.onLoadEarlier}
					isLoadingEarlier={this.state.isLoadingEarlier}

					user={{
						_id: this.state.myId,
						name: (this.state.myInfo == undefined) ? '' : this.state.myInfo.userName
					}}

					renderActions={this.renderCustomActions}
					renderBubble={this.renderBubble}
					renderCustomView={this.renderCustomView}
				/>
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
			</View>
		)
	}

	renderChats(item) {
		return (
			<View style={styles.listcontainer}>
			</View>
		);
	}

}