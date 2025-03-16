import { Message, Collection, ButtonInteraction, ActionRowBuilder, Guild } from "discord.js";
import Client from "#client";
import type { MessageActionRowComponentBuilder } from "discord.js";

export default {
    name: "guilds",
    aliases: ['g'],
    dev: true,
    run: async (client: Client, message: Message<true>) => {
        const guilds = client.guilds.cache.map((g) => g).sort((a, b) => b.memberCount - a.memberCount)
        const options = { extra: true, trash: true, count: 5, page: 0 }

        const msg = await message.reply({
            embeds: [
                await client.storage.embeds.guilds(guilds, options.page)],
            components: [
                ...client.storage.components.guildsSelect(guilds.slice(options.page * options.count, (options.page + 1) * options.count)),
                ...client.storage.components.paginator(guilds, options)
            ]
        })

        const collector = msg.createMessageComponentCollector({ time: 60000 })

        collector.on('collect', async (int): Promise<void> => {
            if (!int.isButton() && !int.isStringSelectMenu()) return

            if (int.isButton()) {
                switch (int.customId) {
                    case 'trash':
                        if (msg.deletable) { 
                            await msg.delete().catch(() => {})
                        }
                        return
                    case 'backward':
                        options.page = 0
                        break
                    case 'left':
                        options.page = Number(int.message.embeds[0].footer!.text.split(': ')[1].split('/')[0]) - 2
                        break
                    case 'right':
                        options.page = Number(int.message.embeds[0].footer!.text.split(': ')[1].split('/')[0])
                        break
                    case 'forward':
                        options.page = Number(int.message.embeds[0].footer!.text.split(': ')[1].split('/')[1]) - 1
                        break
                    default:
                        return
                }

                await int.deferUpdate().catch(() => {})

                await msg.edit({
                    embeds: [ client.storage.embeds.guilds(guilds, options.page) ],
                    components: [
                        ...client.storage.components.guildsSelect(guilds.slice(options.page * options.count, (options.page + 1) * options.count)),
                        ...client.storage.components.paginator(guilds, options)
                    ]
                })
            } else if (int.isStringSelectMenu()) {
                if (int.customId === "guildsSelectInfo") {
                    const g = guilds.find(g => g.id === int.values[0])
                    if(!g) return

                    await int.reply({
                        embeds: [ client.storage.embeds.guildsInfo({ id: g.id, name: g.name, memberCount: g.memberCount, vanityURLCode: g.vanityURLCode, iconURL: () => g.iconURL, ownerId: g.ownerId, channels: { cache: { size: g.channels } }, roles: { cache: { size: g.roles } }, createdTimestamp: g.createdTimestamp } as unknown as Guild) ],
                        ephemeral: true
                    })
                }
            }
        })

        collector.on('end', async (collected: Collection<string, ButtonInteraction>) => {
            const components = msg.components.map(row => {
                const actionRow = ActionRowBuilder.from(row) as ActionRowBuilder<MessageActionRowComponentBuilder>
                actionRow.components.forEach(component => {
                    component.setDisabled(true)
                })

                return actionRow
            })

            await msg.edit({ components }).catch(() => {})
        })
    }
};
