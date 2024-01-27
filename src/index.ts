import { Client, GatewayIntentBits, PermissionFlagsBits, Message } from 'discord.js'
import { exec } from 'child_process'
import * as dotenv from 'dotenv'

dotenv.config()

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

  const args = message.content.split(' ').slice(1)

  console.log(message.content)
  console.log(args)

  if (message.content === "!start") {
    startServer(message)
  } else if (message.content === "!close") {
    closeServer(message)
  }

})

function startServer(message: Message) {
  exec('docker compose up -d', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return message.reply(`Error executing docker compose up: ${error.message}`);
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return message.reply(`logs: \`${stderr}\``);
    }
    message.reply(`docker compose up executed successfully: \`${stdout}\``);
  });
}

function closeServer(message: Message) {
  exec('docker compose down', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return message.reply(`Error executing docker compose down: ${error.message}`);
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return message.reply(`logs: \`${stderr}\``);
    }
    message.reply(`docker compose down executed successfully: \`${stdout}\``);
  });
}


bot.login(process.env.DISCORD_TOKEN)
