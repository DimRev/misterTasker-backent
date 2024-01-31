import { config } from 'dotenv'

config()

export default {
  dbURL: process.env.LCL_DB_URL,
  dbName: process.env.LCL_DB_NAME,
}
