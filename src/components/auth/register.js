import React, { Component } from 'react';
import {
	Text,
	View,
	Image,
	Button,
	Picker,
	ScrollView,
	TextInput,
	AsyncStorage
} from 'react-native';
import styles from './login.style';
import { Fumi } from "react-native-textinput-effects";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, db } from "../../helpers/firebase";
import { NavigationActions } from 'react-navigation';
import { Select, Option } from 'react-native-select-list';


const Item = Picker.Item;

export default class Register extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerStyle: { backgroundColor: 'mediumseagreen' },
			headerTintColor: 'white',
			title: "Register an account"
		}
	}

	constructor(props) {
		super(props);

		this.state = {
			email: "",
			password: "",
			userName: "",
			mobileNumber: "",
			response: "",
			usertype: "customer"
		};

		this.signup = this.signup.bind(this);
	}

	async signup() {
		auth.createUserWithEmailAndPassword(this.state.email, this.state.password).then(async (firebaseUser) => {
			console.log("User " + firebaseUser.uid + " created successfully!");
			console.log(auth.currentUser);
			let usersRef = db.ref("/User");
			let newuser = {};
			newuser.userName = this.state.userName;
			newuser.mobileNumber = this.state.mobileNumber;
			newuser.usertype = this.state.usertype;
			newuser.id = firebaseUser.uid
			newuser.email = this.state.email
			this.setState({
				response: "Account created successfully"
			});
			usersRef.child(firebaseUser.uid).set(newuser, async (error) => {
				if (error) {

				} else {
					await AsyncStorage.setItem('email', this.state.email);
					await AsyncStorage.setItem('password', this.state.password);

					if (newuser.usertype == "customer")
						this._navigateTo('Customer')
					else
						this._navigateTo('Profile')
				}
			});

			return firebaseUser;
		}).catch((error) => {
			console.log("Error: ", error);
			this.setState({
				response: error.message
			})
		});
	}

	_getOptionList() {
		return this.refs['OPTIONLIST'];
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
			<View contentContainerStyle={{ backgroundColor: 'white', justifyContent: 'center' }}>
				{/*For input text*/}
				<View style={styles.card2}>
					<View style={styles.logoContainer}>
						<Image source={require('../../resources/images/fmh_logo.png')} />
					</View>
					<Text style={styles.titleLogin}> Create an account and get started </Text>
					<Fumi
						style={styles.input}
						labelStyle={{ color: '#aaa' }}
						label={'Email address'}
						iconClass={FontAwesomeIcon}
						iconName={'envelope'}
						inputStyle={{ color: 'green' }}
						iconColor={'green'}
						onChangeText={(email) => this.setState({ email })}
					/>
					<Fumi
						style={styles.input}
						labelStyle={{ color: '#aaa' }}
						label={'Password'}
						iconClass={FontAwesomeIcon}
						iconName={'key'}
						secureTextEntry={true}
						inputStyle={{ color: 'green' }}
						iconColor={'green'}
						onChangeText={(password) => this.setState({ password })}
					/>

					<View style={[styles.input, { backgroundColor: 'white', flexDirection: 'row' }]}>
						<Icon name="gear" size={20} color="gray" style={[styles.eachIcon, { marginTop: 12 }]} />
						<Text style={[styles.titleLogin, { color: 'gray', marginLeft: 15, fontSize: 16, flex: 1, textAlign: 'left', marginTop:23 }]}>User Type</Text>
						<Select
							selectStyle={{backgroundColor:'white', height:45, alignItems:'flex-end'}}
							listStyle={{backgroundColor:'white'}}
							selectTextStyle={{backgroundColor:'white', color:'green', fontSize:18}}
							onSelect={(usertype) => {
								console.log(usertype)
								this.setState({usertype: usertype})
							}
						}>
							<Option optionTextStyle={{color:'green', fontSize:18}} value="business">Business</Option>
							<Option optionTextStyle={{color:'green', fontSize:18}} value="customer">Customer</Option>
						</Select>
					</View>

					<Fumi
						style={styles.input}
						labelStyle={{ color: '#aaa' }}
						label={'BusinessName or Customer Name'}
						iconClass={FontAwesomeIcon}
						iconName={'user'}
						inputStyle={{ color: 'green' }}
						iconColor={'green'}
						onChangeText={(userName) => this.setState({ userName })}
					/>
					<Fumi
						style={styles.input}
						labelStyle={{ color: '#aaa' }}
						keyboardType='numeric'
						label={'Mobile'}
						iconClass={FontAwesomeIcon}
						iconName={'mobile'}
						inputStyle={{ color: 'green' }}
						iconColor={'green'}
						onChangeText={(mobileNumber) => this.setState({ mobileNumber })}
					/>




				</View>

				{/*For response*/}
				<View>
					<Text style={styles.response}>{this.state.response}</Text>
				</View>

				{/*For Button*/}
				<View style={styles.submit}>
					<Button
						onPress={this.signup}
						title="Sign up"
						color="green"
					/>
				</View>

				{/*For Text Sign up*/}
				<Text style={styles.wrapTextAccount}>
					<Text> Already have an account? </Text>
					<Text style={styles.signup} ellipsizeMode={'tail'} onPress={() => this.props.navigation.goBack()}> Sign in </Text>
				</Text>

			</View>
		)
	}
}