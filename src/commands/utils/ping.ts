import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

const pingCommand = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.reply('Pong!')
	},
}

export default pingCommand