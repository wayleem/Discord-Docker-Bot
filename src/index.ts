import { Client, GatewayIntentBits, PermissionFlagsBits, Message } from 'discord.js'
import { exec } from 'child_process'
import * as dotenv from 'dotenv'

dotenv.config()

const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
})

const rateLimitMap = new Map<string, number[]>()
const silenceMap = new Map<string, number>()
const commandThreshold = 3
const rateLimitDuration = 30000
const commandCooldown = 5000

bot.once('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`)
})

bot.on('messageCreate', async message => {
  if (!message.guild || !message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
    return
  }

  const now = Date.now()
  const timestamps = rateLimitMap.get(message.author.id) || []
  const silenceTimestamp = silenceMap.get(message.author.id)

  if (silenceTimestamp && now < silenceTimestamp) {
    return
  }

  if (timestamps.length >= commandThreshold) {
    const timeSinceLastCommand = now - timestamps[timestamps.length - 1]
    if (timeSinceLastCommand < rateLimitDuration) {
      if (!silenceTimestamp) {
        message.reply(`${message.author.displayName}, you're sending commands too quickly. You will be ignored for 30 seconds.`)
        silenceMap.set(message.author.id, now + rateLimitDuration)
      }
      return
    }
    while (timestamps.length && now - timestamps[0] > commandCooldown) {
      timestamps.shift()
    }
  }

  if (silenceTimestamp) {
    silenceMap.delete(message.author.id)
  }

  timestamps.push(now)
  rateLimitMap.set(message.author.id, timestamps)

  if (message.content.startsWith("!start")) {
    startServer(message)
  } else if (message.content.startsWith("!close")) {
    closeServer(message)
  } else if (message.content.startsWith("!status")) {
    checkServerStatus(message)
  }
})

async function checkServerStatus(message: Message, quiet = false): Promise<boolean> {
  return new Promise((resolve, reject) => {
    exec('docker ps --filter "name=w-mc-1" --format "{{.Status}}"', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`)
        message.reply(`Error checking server status: ${error.message}`)
        return reject(error)
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        message.reply(`Error checking server status: ${stderr}`)
        return reject(new Error(stderr))
      }
      if (stdout.includes("Up") || stdout.includes("starting")) {
        if (!quiet) {
          message.reply('The server is already up or starting.')
        }
        return resolve(true)
      }
      if (!quiet) {
        message.reply('The server is not currently running.')
      }
      return resolve(false)
    })
  })
}

async function startServer(message: Message) {
  const isUp = await checkServerStatus(message, true)
  if (!isUp) {
    exec('docker compose up -d', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`)
        return message.reply(`Error executing docker compose up: ${error.message}`)
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        return message.reply(`logs: \`${stderr}\``)
      }
      message.reply(`docker compose up executed successfully: \`${stdout}\``)
    })
  } else {
    message.reply('The server is already up or starting.')
  }
}

function closeServer(message: Message) {
  exec('docker compose down', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      message.reply(`Error executing docker compose down: ${error.message}`)
      return
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`)
      message.reply(`logs: \`${stderr}\``)
      return
    }
    message.reply(`docker compose down executed successfully: \`${stdout}\``)
  })
}

bot.login(process.env.DISCORD_TOKEN)
