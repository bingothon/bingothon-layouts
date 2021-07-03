import firebase from "firebase";
import "firebase/database"
import { Configschema } from '../../configschema';
import * as nodecgApiContext from './util/nodecg-api-context';

const nodecg = nodecgApiContext.get();
const config = nodecg.bundleConfig as Configschema;

var options = {
    databaseURL:config.firebase.dbURL,
    rootRef: "rootRef",
    secretKey: config.firebase.secret,
    UID: config.firebase.userID,
    admin: true
}

export const db = firebase
    .initializeApp(options)
    .database()

