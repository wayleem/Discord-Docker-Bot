import { Client, GatewayIntentBits } from 'discord.js'
import { NodeSSH } from 'node-ssh'
import * as dotenv from 'dotenv'

dotenv.config()

const ssh = new NodeSSH()
const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
})

bot.login(process.env.DISCORD_TOKEN)
