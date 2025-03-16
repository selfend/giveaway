import { ButtonInteraction, InteractionCollector, EmbedBuilder, MessageFlags } from "discord.js";
import type Client from "#client";

export default {
    name: 'listMembers',
    run: async (client: Client, interaction: ButtonInteraction<"cached">) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const doc = await client.giveaway.get(interaction.message.id)
        if(!doc) {
            return interaction.editReply({
                embeds: [client.storage.embeds.notfoundType('Неизвестный розыгрыш')]
            })
        }

        const options = { page: 0, count: 10, extra: true }

        const message = await interaction.editReply({
            embeds: [ client.storage.embeds.giveawayListMembers(interaction.member, doc) ],
            components: client.storage.components.paginator(doc.members, options)
        })

        const collector = new InteractionCollector(
            client, { message, time: 60_000 }
        )

        collector.on('collect', (int: any) => {
            if(int.isButton()) {
                switch(int.customId) {
                    case 'backward':
                        options.page = 0
                        return interaction.editReply({
                            embeds: [ client.storage.embeds.giveawayListMembers(interaction.member, doc, options.page) ],
                            components: client.storage.components.paginator(doc.members, options)
                        })
                    case 'left':
                        options.page = Number(int.message.embeds[0].footer!.text.split(': ')[1].split('/')[0])-2
                        return interaction.editReply({
                            embeds: [ client.storage.embeds.giveawayListMembers(interaction.member, doc, options.page) ],
                            components: client.storage.components.paginator(doc.members, options)
                        })
                    case 'right':
                        options.page = Number(int.message.embeds[0].footer!.text.split(': ')[1].split('/')[0])
                        return interaction.editReply({
                            embeds: [ client.storage.embeds.giveawayListMembers(interaction.member, doc, options.page) ],
                            components: client.storage.components.paginator(doc.members, options)
                        })
                    case 'forward':
                        options.page = Number(int.message.embeds[0].footer!.text.split(': ')[1].split('/')[1])-1
                        return interaction.editReply({
                            embeds: [ client.storage.embeds.giveawayListMembers(interaction.member, doc, options.page) ],
                            components: client.storage.components.paginator(doc.members, options)
                        })
                }
            }

            return int.deferUpdate().catch(() => {})
        })

        return collector.on('end', () => interaction.editReply({ components: [] }))
    }
}