import { Client, GatewayIntentBits, PermissionFlagsBits, Message } from 'discord.js'
import { exec } from 'child_process'
import * as dotenv from 'dotenv'

dotenv.config()

const userCommandCounts = new Map<string, { count: number; timestamp: number; ignoreUntil: number }>()
const cooldownAmount = 5000 // Cooldown period in milliseconds (5 seconds)
const muteThreshold = 3 // Number of commands to trigger ignore
const muteDuration = 60000 // Duration to ignore commands in milliseconds (60 seconds)
const commandProcessing = new Set<string>()

const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
})

bot.once('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`)
});


bot.on('messageCreate', async message => {
  if (!message.guild || !message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
    return
  }

  /*
  if (message.author.bot) {
    return
  }

  const userRecord = userCommandCounts.get(message.author.id)
  if (userRecord && Date.now() < userRecord.ignoreUntil) {
    console.log("ignore")
    return
  }

  if (commandProcessing.has(message.author.id)) {
    return
  }

  if (!userRecord || Date.now() > userRecord.timestamp + cooldownAmount) {
    console.log("ignoring " + message.author.displayName)
    userCommandCounts.set(message.author.id, { count: 1, timestamp: Date.now(), ignoreUntil: 0 })
  } else {
    userRecord.count++
    userRecord.timestamp = Date.now()
    if (userRecord.count >= muteThreshold) {
      userRecord.ignoreUntil = Date.now() + muteDuration
      return
    }
    userCommandCounts.set(message.author.id, userRecord)
  }

  commandProcessing.add(message.author.id)

  */
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
