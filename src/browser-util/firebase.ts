import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { Configschema } from '../../configschema'

const config = nodecg.bundleConfig as Configschema

const firebaseConfig = config.firebaseConfig
const logger = new nodecg.Logger(`${nodecg.bundleName}:firebase`)

const fbApp = initializeApp(firebaseConfig)
const auth = getAuth(fbApp)
signInAnonymously(auth)
    .then(() => {
        logger.info('Signed in to Firebase')
    })
    .catch((error) => {
        logger.error('Failed to login to Firebase', error)
    })

export const db = getDatabase(fbApp)

logger.warn(`the loaded firebase database`, db)
