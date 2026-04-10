# discord-bot-template

This repository is a template that contains boilerplate code to get your Discord bot up and running easily.

## Setup

1. Create a `config.json` file in the root directory with the following code block:

   ```json
   // config.json

   {
     "token": "Your token goes here",
     "clientId": "Client ID goes here",
     "guildId": "Guild ID goes here"
   }
   
Make sure to replace the example values with your own Discord bot token, client ID, and guild ID.
   
2. Install the required dependencies by running the following command in your terminal:

```
npm install
```

3. Register your commands to the specified guild and start the bot by running the following commands: 
 
 ```
 npm run deploy-commands
 npm start
 ```

### More Information

For more information on how to use and customize this Discord bot template, refer to the [discord.js documentation](https://discord.js.org/)
