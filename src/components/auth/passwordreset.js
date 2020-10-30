import React, { Component } from 'react';
import {
	Text,
	View,
	ScrollView,
	Image,
	Button,
	TextInput
} from 'react-native';
import styles from './../auth/login.style';
import { Fumi } from "react-native-textinput-effects";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, db, storage } from '../../helpers/firebase';

export default class PasswordReset extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerStyle: { backgroundColor: 'mediumseagreen' },
			headerTintColor:'white',
			title: "Reset password"
		}
	}

	constructor(props) {
		super(props);
		this.state = {
			email: "",
			response: ""
		};
		this.sendResetEmail = this.sendResetEmail.bind(this);
	}

	async sendResetEmail() {
		auth.sendPasswordResetEmail(this.state.email).then(() => {
			this.setState({
				response: "Email sent successfully. Please check."
			});
		}, (error) => {
			console.log(error)
			this.setState({
				response: "An error occued while email sent."
			});
		});
	}

	render() {

		return (
			<View style={styles.container} contentContainerStyle={{ backgroundColor:'white'}}>
				{/*For input text*/}
				<View style={styles.card2}>
					<View style={styles.logoContainer}>
						<Image source={require('../../resources/images/fmh_logo.png')} />
					</View>
					<Text style={styles.titleLogin}> Reset a password </Text>
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
				</View>

				{/*For response*/}
				<View>
					<Text style={styles.response}>{this.state.response}</Text>
				</View>

				{/*For Button*/}
				<View style={styles.profilesubmit}>
					<Button
						style={styles.button}
						onPress={this.sendResetEmail}
						title="Send reset email"
						color="green"
					/>
				</View>
			</View>
		)
	}
}