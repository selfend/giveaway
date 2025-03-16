import { ButtonInteraction, EmbedBuilder } from "discord.js";
import type Client from "#client";

export default {
    name: 'leaveGiveaway',
    run: async (client: Client, interaction: ButtonInteraction<"cached">) => {
        const messageId = interaction.customId.split(':')[1]

        const doc = await client.giveaway.get(messageId)
        if(!doc) {
            return interaction.update({
                content: null,
                embeds: [client.storage.embeds.notfoundType('Неизвестный розыгрыш')],
                components: []
            })
        }

        if(!doc.isActive) {
            return interaction.update({
                content: null,
                embeds: [client.storage.embeds.errorType('Розыгрыш **уже** закончен')],
                components: []
            })
        }

        if(!doc.members.includes(interaction.user.id)) {
            return interaction.update({
                content: null,
                embeds: [client.storage.embeds.errorType('Вы и так **не** участвуете в **этом** розыгрыше')],
                components: []
            })
        }

        doc.members.splice(doc.members.indexOf(interaction.user.id), 1)
        doc.markModified('members')
        await client.giveaway.save(doc)

        const message = await interaction.channel!.messages.fetch(messageId).catch(() => null)
        if(message) {
            await message.edit({
                components: client.storage.components.giveawayHoist(doc)
            })
        }

        return interaction.update({
            content: null,
            embeds: [client.storage.embeds.successType(`Вы больше **не участвуете** в розыгрыше на **${doc.name}**`)],
            components: []
        })
    }
}