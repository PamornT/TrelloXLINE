export interface LineConfig {
  channelSecret: string
  channelAccessToken: string
}

export interface firebaseConfig {
  apiKey: string
  authDomain: string
  databaseURL: string
  projectId: string
  storageBucket: string
}

export interface Configuration {
  line: LineConfig
  firebase: firebaseConfig
}

let configuration: Configuration

const initialConfig = (file: string) => {
  configuration = require(file)
}

const getConfig = (): Configuration => {
  if (configuration) {
    return configuration
  }

  throw new Error("configuration has not been initialized")
}

export {
  initialConfig,
  getConfig,
}