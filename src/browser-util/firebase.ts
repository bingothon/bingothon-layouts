import firebase from 'firebase/compat/app'
import 'firebase/compat/database'
import { Configschema } from '../../configschema'

const config = nodecg.bundleConfig as Configschema

const firebaseConfig = config.firebaseConfig
const logger = new nodecg.Logger(`${nodecg.bundleName}:firebase`)

firebase.initializeApp(firebaseConfig)

// .auth()
// .signInAnonymously()
// .then(() => {
//     logger.info('Signed in to Firebase')
// })
// .catch((error) => {
//     logger.error('Failed to login to Firebase', error)
// })
logger.warn(`the loaded firebase database`, firebase.database())
export const db = firebase.database()
