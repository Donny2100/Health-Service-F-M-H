import firebase from "firebase";

const config = {
	apiKey: "AIzaSyCBJ-_9YANKk7LHTLzhz1FhlxrOLVp5QJY",
	authDomain: "fir-test1-7cb44.firebaseapp.com",
	databaseURL: "https://fir-test1-7cb44.firebaseio.com",
	storageBucket: "fir-test1-7cb44.appspot.com"
}

firebase.initializeApp(config);

export const auth = firebase.auth();
export const db = firebase.database();
export const storage = firebase.storage();