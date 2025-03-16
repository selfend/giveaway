import { type ModalSubmitInteraction } from "discord.js";
import type Client from "#client";

export default {
    name: 'giveawayReroll',
    run: async (client: Client, interaction: ModalSubmitInteraction<'cached'>) => {
        const messageId = interaction.customId.split(':')[1]

        const doc = await client.giveaway.get(messageId)
        if(!doc) {
            return interaction.reply({
                embeds: [ client.storage.embeds.defaultStyle(interaction.member, 'Реролл', 'Неизвестный розыгрыш') ],
                ephemeral: true
            })
        }

        if(doc.isActive) {
            return interaction.reply({
                embeds: [ client.storage.embeds.defaultStyle(interaction.member, 'Реролл', 'Розыгрыш ещё **не** завершен') ],
                ephemeral: true
            })
        }

        let count = interaction.fields.getTextInputValue('count') || doc.countWinner
        if(client.isNotNumber(count, { minChecked: 1 })) {
            return interaction.reply({
                embeds: [ client.storage.embeds.defaultStyle(interaction.member, 'Реролл', 'некорректное кол-во победителей') ],
                ephemeral: true
            })
        }

        const winners = await client.giveaway.getWinners(interaction.guild, doc)

        const content = `${interaction.member.toString()} переопределяет победителей! Поздравляем ${winners.map(id => `<@!${id}>`).join(', ')}`

        const message = await interaction.channel!.messages.fetch(messageId).catch(() => null)
        if(message) {
            await interaction.deferUpdate()
            return message.reply({ content })
        } else {
            return interaction.reply({ content })
        }
    }
}