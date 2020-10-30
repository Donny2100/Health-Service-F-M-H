import firebase from "firebase";

const config = {
	apiKey: "",
	authDomain: "",
	databaseURL: "",
	storageBucket: ""
}

firebase.initializeApp(config);

export const auth = firebase.auth();
export const db = firebase.database();
export const storage = firebase.storage();