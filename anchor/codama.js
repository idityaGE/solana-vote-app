// NOTE: The local createCodamaConfig is a temporary workaround until gill ships the fix for https://github.com/gillsdk/gill/issues/207
// import { createCodamaConfig } from 'gill'
import { createCodamaConfig } from './src/create-codama-config.js'

export default createCodamaConfig({
  clientJs: 'anchor/src/client/js/generated',
  idl: 'target/idl/solanavoteapp.json',
})
