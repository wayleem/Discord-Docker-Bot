# Discord Docker Bot
Build and deploy a discord bot onto your server to collaboratively manage docker containers with your discord server. 
## Guide
1. You need node installed to run this bot on your server.
2. Make sure you have a discord bot and have the token saved.
 a. If you don't already have a discord bot, go create one at https://discord.com/developers/applications
 b. Go into OAuth2 - URL Generator and enable the bot checkbox in the scopes and invite the bot to your server.
3. Clone the repository into your server directory.
4. `cd` into `discord-docker-bot/` and run `npm i`.
5. Create a `.env` file to store your discord token with this key.
``DISCORD_TOKEN=[your discord bot token]``
6. Run `npm run start` to start the bot.
7. Now the bot should be online in your discord server. The repo comes with default cmds `!start` and `!close` to start and shut down your docker container.
