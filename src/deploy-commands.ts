import 'dotenv/config'
import { REST, Routes, type RESTPostAPIApplicationCommandsJSONBody } from 'discord.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const { CLIENT_ID, GUILD_ID, TOKEN } = process.env

if (!CLIENT_ID) {
  throw new Error('Missing CLIENT_ID in environment variables.')
}

if (!GUILD_ID) {
  throw new Error('Missing GUILD_ID in environment variables.')
}

if (!TOKEN) {
  throw new Error('Missing TOKEN in environment variables.')
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

type DeployableCommandModule = {
  data: {
    toJSON: () => RESTPostAPIApplicationCommandsJSONBody
  }
  execute: (...args: unknown[]) => unknown
}

const commands: RESTPostAPIApplicationCommandsJSONBody[] = []
const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder)

  if (!fs.statSync(commandsPath).isDirectory()) {
    continue
  }

  const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts'))

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const commandModule = (await import(filePath)) as {
      default?: DeployableCommandModule
      data?: DeployableCommandModule['data']
      execute?: DeployableCommandModule['execute']
    }

    const command = commandModule.default ?? commandModule

    if ('data' in command && 'execute' in command && command.data && command.execute) {
      commands.push(command.data.toJSON())
    } else {
      console.warn(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      )
    }
  }
}

const rest = new REST().setToken(TOKEN)

try {
  console.log(`Started refreshing ${commands.length} application (/) commands.`)

  const data = await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  )

  console.log(
    `Successfully reloaded ${(data as unknown[]).length} application (/) commands.`
  )
} catch (error) {
  console.error(error)
}