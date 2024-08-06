# 🤖 Discord Docker Bot

Build and deploy a Discord bot onto your server to collaboratively manage Docker containers with your Discord server.
## 📚 Guide

1. **Node Installation**: You need Node.js installed to run this bot on your server.

2. **Discord Bot Setup**: Make sure you have a Discord bot and have the token saved.
    - If you don't already have a Discord bot, create one at [Discord Developers](https://discord.com/developers/applications).
    - Go into OAuth2 - URL Generator and enable the bot checkbox in the scopes and invite the bot to your server.

3. **Clone Repository**: Clone the repository into your server directory.
    ```bash
    git clone https://github.com/yourusername/discord-docker-bot.git
    cd discord-docker-bot
    ```

4. **Install Dependencies**: Run npm install to install the necessary dependencies.
    ```bash
    npm install
    ```

5. **Create .env File**: Create a `.env` file to store your Discord token with this key.
    ```plaintext
    DISCORD_TOKEN=[your discord bot token]
    ```

6. **Start the Bot**: Run npm run start to start the bot.
    ```bash
    npm run start
    ```

7. **Bot Online**: Now the bot should be online in your Discord server. The repo comes with default commands `!start` and `!close` to start and shut down your Docker container.

## 🤝 Contributing

I welcome contributions for more management tools! If you have any improvements or new features to add, please follow these steps:

- Fork the repository
- Create a new branch (`git checkout -b feature/YourFeature`)
- Commit your changes (`git commit -m 'Add some feature'`)
- Push to the branch (`git push origin feature/YourFeature`)
- Open a pull request

## 📧 Contact

For any questions or suggestions, feel free to reach out:

- **Email**: [wayleemh@gmail.com](mailto:wayleemh@gmail.com)
- **LinkedIn**: [William Huang](https://www.linkedin.com/in/will-huang2/)
