import { ContextMenuCommandBuilder, ApplicationCommandType, MessageContextMenuCommandInteraction, PermissionFlagsBits } from "discord.js";
import type Client from "#client";

export default {
    options: new ContextMenuCommandBuilder()
    .setName('Остановить')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setType(ApplicationCommandType.Message),
    run: async (client: Client, interaction:MessageContextMenuCommandInteraction<"cached">) => {
        if(interaction.targetMessage.author.id !== client.user.id) {
            return interaction.reply({
                embeds: [ client.storage.embeds.defaultStyle(interaction.member, 'Остановить розыгрыш', 'сообщение **не** является розыгрышем') ],
                ephemeral: true
            })
        }

        const doc = await client.giveaway.get(interaction.targetId)
        if(!doc) {
            return interaction.reply({
                embeds: [ client.storage.embeds.defaultStyle(interaction.member, 'Остановить розыгрыш', 'неизвестный розыгрыш') ],
                ephemeral: true
            })
        }

        if(!doc.isActive) {
            return interaction.reply({
                embeds: [ client.storage.embeds.defaultStyle(interaction.member, 'Остановить розыгрыш', 'розыгрыш **уже** завершен') ],
                ephemeral: true
            })
        }

        doc.endTimestamp = Date.now()
        await client.giveaway.save(doc)
        await client.giveaway.checkGiveaway(interaction.guild, doc)

        return interaction.reply({
            embeds: [ client.storage.embeds.defaultStyle(interaction.member, 'Остановить розыгрыш', `Вы **остановили** розыгрыш на **${doc.name}**`) ],
            ephemeral: true
        })
    }
}