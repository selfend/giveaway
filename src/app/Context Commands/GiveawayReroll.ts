import { ContextMenuCommandBuilder, ApplicationCommandType, MessageContextMenuCommandInteraction, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } from "discord.js";
import type Client from "#client";

export default {
    options: new ContextMenuCommandBuilder()
    .setName('Реролл')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setType(ApplicationCommandType.Message),
    run: async (client: Client, interaction:MessageContextMenuCommandInteraction<"cached">) => {
        if(interaction.targetMessage.author.id !== client.user.id) {
            return interaction.reply({
                embeds: [ client.storage.embeds.defaultStyle(interaction.member, 'Реролл', 'сообщение **не** является розыгрышем') ],
                ephemeral: true
            })
        }

        const doc = await client.giveaway.get(interaction.targetId)
        if(!doc) {
            return interaction.reply({
                embeds: [ client.storage.embeds.defaultStyle(interaction.member, 'Реролл', 'неизвестный розыгрыш') ],
                ephemeral: true
            })
        }

        if(doc.isActive) {
            return interaction.reply({
                embeds: [ client.storage.embeds.defaultStyle(interaction.member, 'Реролл', 'розыгрыш ещё **не** завершен') ],
                ephemeral: true
            })
        }

        if(!doc.members.length) {
            return interaction.reply({
                embeds: [ client.storage.embeds.defaultStyle(interaction.member, 'Реролл', 'в розыгрыше **никто** не участвовал') ],
                ephemeral: true
            })
        }

        return interaction.showModal(
            new ModalBuilder()
            .setCustomId(`giveawayReroll:${interaction.targetId}`)
            .setTitle('Перевыбрать победителей')
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>()
                .addComponents(
                    new TextInputBuilder()
                    .setCustomId('count')
                    .setLabel('Количество')
                    .setMaxLength(2)
                    .setPlaceholder(String(client.random(1, 5)))
                    .setStyle(TextInputStyle.Short)
                    .setValue(String(doc.countWinner))
                    .setRequired(false)
                )
            )
        )
    }
}