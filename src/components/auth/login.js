import React, { Component } from 'react';
import {
	Text,
	View,
	Image,
	Button,
	ScrollView,
	TouchableOpacity,
	TextInput,
	BackHandler,
	AsyncStorage
} from 'react-native';
import styles from './login.style';
import { Fumi } from "react-native-textinput-effects";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, db } from '../../helpers/firebase';
import { NavigationActions } from 'react-navigation'
import FBSDK, { LoginManager } from 'react-native-fbsdk'

export default class Login extends Component {
	static navigationOptions = {
		header: null
	}

	constructor(props) {
		super(props);
		this.isLoggedIn(this)

		this.state = {
			email: "",
			password: "",
			response: "",
		};

		this.login = this.login.bind(this);
		this._fbAuth = this._fbAuth.bind(this);
	}

	componentDidMount() {
	}

	async isLoggedIn(self) {
		const email = await AsyncStorage.getItem('email');
		if (email !== null) {
			password = await AsyncStorage.getItem('password');
			self.state = {
				email: email,
				password: password,
			};
			console.log(email, password)
			this.login()
		}
	}

	_fbAuth() {
		console.log("_fbAuth")
		LoginManager.logInWithReadPermissions(['public_profile']).then((result) => {
			console.log(result);
			if (result.isCancelled) {
				console.log("login was cancelled");
			} else {
				console.log('login was a success' + result.grantedPermissions.toString());
				this.props.navigation.navigate("Profile")
			}
		}, function (error) {
			console.log('an error occured' + error);
		})
	}

	async login() {
		try {
			await auth.signInWithEmailAndPassword(this.state.email, this.state.password);
			this.setState({
				response: "Logged In!"
			});
			await AsyncStorage.setItem('email', this.state.email);
			await AsyncStorage.setItem('password', this.state.password);
			//this.props.navigation.navigate("Profile")

			let user = auth.currentUser;
			db.ref('/User').child(user.uid).once('value', (snapshot) => {
				if (snapshot.exists()) {
					let userinfo = snapshot.val();
					if (userinfo.usertype == "customer")
						this._navigateTo('Customer')
					else
						this._navigateTo('Profile')
				}
			});
		} catch (error) {
			this.setState({
				response: error.toString()
			})
		}
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

			<ScrollView contentContainerStyle={{ backgroundColor: 'white', flex: 1, justifyContent: 'center' }}>
				{/*For input text*/}
				<View style={styles.card2}>
					<View style={styles.logoContainer}>
						<Image source={require('../../resources/images/fmh_logo.png')} />
					</View>
					<Text style={styles.titleLogin}> Login to access your account </Text>
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
						secureTextEntry={true}
						labelStyle={{ color: '#aaa' }}
						label={'Password'}
						iconClass={FontAwesomeIcon}
						iconName={'key'}
						inputStyle={{ color: 'green' }}
						iconColor={'green'}
						onChangeText={(password) => this.setState({ password })}
					/>
					<TouchableOpacity onPress={() => this.props.navigation.navigate("PasswordReset")}><Text style={styles.forgotPassword}> Forgot password? </Text></TouchableOpacity>
				</View>

				{/*For response*/}
				<View>
					<Text style={styles.response}>{this.state.response}</Text>
				</View>

				{/*For Button*/}
				<View style={styles.submit}>
					<Button
						onPress={this.login}
						title="Sign in"
						color="green"
					/>
				</View>

				{/*For Text Sign up*/}
				<Text style={styles.wrapTextAccount}>
					<Text> Don't have an account? </Text>
					<Text style={styles.signup} ellipsizeMode={'tail'} onPress={() => this.props.navigation.navigate('Register')}> Sign up </Text>
				</Text>

				{/*Sign in*/}
				<Text style={styles.signin}> Sign in with </Text>

				{/*For Icon*/}
				<View style={styles.icon}>
					<Icon name="twitter" size={20} color="green" style={styles.eachIcon} />
					<Icon name="facebook" size={20} color="green" style={styles.eachIcon} onPress={this._fbAuth} />
				</View>

			</ScrollView>
		)
	}
}