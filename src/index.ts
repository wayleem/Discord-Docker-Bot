import { Client, GatewayIntentBits, PermissionFlagsBits, Message } from 'discord.js'
import { NodeSSH } from 'node-ssh'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'
import { SSHConfig, Configs } from './types'


dotenv.config()

const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
})

bot.on('messageCreate', async message => {
  if (!message.guild || !message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
    return
  }

  const args = message.content.split(' ').slice(1)

  console.log(message.content)
  console.log(args)

  if (message.content.startsWith('!sethost')) {
    setHost(message, args)
  } else if (message.content.startsWith('!setusername')) {
    setUsername(message, args)
  } else if (message.content.startsWith('!setport')) {
    setPort(message, args)
  } else if (message.content.startsWith('!setkey')) {
    setKey(message)
  } else if (message.content === '!viewconfig') {
    viewConfig(message)
  }

})

function setHost(message: Message, args: string[]) {
  if (args.length !== 1) {
    return message.reply('Please provide the host IP. Usage: `!sethost [host]`')
  }
  updateConfig(message.guild.id, 'host', args[0])
  message.reply('Host updated successfully.')
}

function setUsername(message: Message, args: string[]) {
  if (args.length !== 1) {
    return message.reply('Please provide the username. Usage: `!setusername [username]`')
  }
  updateConfig(message.guild.id, 'username', args[0])
  message.reply('Username updated successfully.')
}

function setPort(message: Message, args: string[]) {
  if (args.length !== 1) {
    return message.reply('Please provide the username. Usage: `!setport [port]`')
  }
  updateConfig(message.guild.id, 'port', args[0])
  message.reply('Port updated successfully.')
}

async function setKey(message: Message<boolean>) {
  if (message.attachments.size > 0) {
    const file = message.attachments.first() // Get the first attachment
    if (file) {
      try {
        // Download the file, read its contents, and store the key
        const response = await axios.get(file.url, { responseType: 'text' })
        const privateKey = response.data

        updateConfig(message.guild!.id, 'privateKey', privateKey)
        message.reply('SSH private key updated successfully.')
      } catch (error) {
        console.error("Error setting SSH key:", error)
        message.reply('Failed to set SSH private key. Please try again.')
      }
    }
  } else {
    message.reply('Please attach a file containing the SSH private key.')
  }
}

function viewConfig(message: Message<boolean>) {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const configFilePath = path.join(__dirname, 'sshConfigs.json');
  if (!fs.existsSync(configFilePath)) {
    return message.reply('No configuration found.');
  }

  const configs: Configs = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
  const config = configs[guildId];

  if (!config) {
    message.reply('No configuration set for this server.');
  } else {
    message.reply(`Current SSH Configuration:\nHost: ${config.host || 'Not set'}\nUsername: ${config.username || 'Not set'}\nPort: ${config.port || 'Not set'}`);
  }
}

function updateConfig(guildId: string, key: keyof SSHConfig, value: string) {
  const configFilePath = path.join(__dirname, 'sshConfigs.json')
  let configs: Configs = {}

  if (fs.existsSync(configFilePath)) {
    configs = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'))
  }

  const guildConfig = configs[guildId] || {
    host: '',
    username: '',
    port: '22', // Default SSH port, change if needed
    privateKey: ''
  }
  guildConfig[key] = value
  configs[guildId] = guildConfig

  fs.writeFileSync(configFilePath, JSON.stringify(configs, null, 2))
}

function saveSSHConfig(guildId: string, config: SSHConfig) {
  const configFilePath = path.join(__dirname, 'sshConfigs.json')
  let configs: Configs = {}

  if (fs.existsSync(configFilePath)) {
    configs = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'))
  }

  configs[guildId] = config
  fs.writeFileSync(configFilePath, JSON.stringify(configs, null, 2))
}

bot.login(process.env.DISCORD_TOKEN)
