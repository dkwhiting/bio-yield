import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  type ChatInputCommandInteraction,
  type SlashCommandBuilder,
  type SlashCommandSubcommandsOnlyBuilder,
  type SlashCommandOptionsOnlyBuilder,
  type ContextMenuCommandBuilder,
} from 'discord.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (!process.env.TOKEN) {
  throw new Error('Missing TOKEN in environment variables.')
}

type CommandData =
  | SlashCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | SlashCommandOptionsOnlyBuilder
  | ContextMenuCommandBuilder

type BotCommand = {
  data: CommandData
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}

function isBotCommand(value: unknown): value is BotCommand {
  return !!value &&
    typeof value === 'object' &&
    'data' in value &&
    'execute' in value &&
    !!(value as { data?: unknown }).data &&
    typeof (value as { execute?: unknown }).execute === 'function'
}

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, BotCommand>
  }
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
})

client.commands = new Collection<string, BotCommand>()

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder)

  if (!fs.statSync(commandsPath).isDirectory()) {
    continue
  }

  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(
      (file) =>
        (file.endsWith('.ts') || file.endsWith('.js')) &&
        !file.endsWith('.d.ts')
    )

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const commandModule = (await import(filePath)) as {
      default?: BotCommand
      data?: BotCommand['data']
      execute?: BotCommand['execute']
    }

    const command = commandModule.default ?? commandModule

    if (isBotCommand(command)) {
      client.commands.set(command.data.toJSON().name, command)
    } else {
      console.warn(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      )
    }
  }
}

console.log('Loaded commands:', [...client.commands.keys()])

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = interaction.client.commands.get(interaction.commandName)

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)

    const errorResponse = {
      content: 'There was an error while executing this command!',
      ephemeral: true as const,
    }

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorResponse)
    } else {
      await interaction.reply(errorResponse)
    }
  }
})

await client.login(process.env.TOKEN)