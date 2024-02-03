import { Client, GatewayIntentBits, PermissionFlagsBits, Message } from 'discord.js'
import { exec } from 'child_process'
import * as dotenv from 'dotenv'

dotenv.config()

const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
})

const rateLimitMap = new Map<string, number[]>(); // Maps a user ID to an array of timestamps
const commandThreshold = 3; // Number of commands to trigger the rate limit
const rateLimitDuration = 30000; // Duration to ignore commands after hitting the rate limit (30 seconds)
const commandCooldown = 5000; // Cooldown between commands (5 seconds)

bot.once('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`)
})

bot.on('messageCreate', async message => {
  if (!message.guild || !message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
    return
  }

  const now = Date.now()
  const timestamps = rateLimitMap.get(message.author.id) || []

  // If the user has sent 3 commands in quick succession, check for rate limit
  if (timestamps.length >= commandThreshold) {
    const timeSinceLastCommand = now - timestamps[timestamps.length - 1]
    if (timeSinceLastCommand < rateLimitDuration) {
      return // Ignore the command
    }
    // Remove expired timestamps
    while (timestamps.length && now - timestamps[0] > commandCooldown) {
      timestamps.shift()
    }
  }

  // Add the timestamp for the new command
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
