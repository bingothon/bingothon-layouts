import firebase from "firebase";
import "firebase/database"
import {Configschema} from '../../configschema';
import * as nodecgApiContext from './util/nodecg-api-context';
import {error} from "json-schema-to-typescript/dist/src/utils";

const nodecg = nodecgApiContext.get();
const config = nodecg.bundleConfig as Configschema;

const firebaseConfig = config.firebaseConfig;

firebase.initializeApp(firebaseConfig);

firebase.auth().signInAnonymously().then(() => {
    nodecg.log.info("Signed in to Firebase")
}).catch((error) => {
    nodecg.log.error("Failed to login to Firebase", error)
})

export const db = firebase.database()

