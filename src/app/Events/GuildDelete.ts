import { Guild, TextChannel } from "discord.js";
import type Client from "#client";

export default {
    name: 'guildDelete',
    run: async (client: Client, guild: Guild) => {
        
        const owner = await guild.fetchOwner().catch(() => null)
        const guilds = client.guilds.cache
            .sort((a, b) => {
                return (b.memberCount - a.memberCount)
            })

        const embed = client.storage.embeds.defaultColor()
            .setAuthor(
                {
                    name: `${guild.name}`,
                    iconURL: client.config.icons.guildLeave
                }
            )
            .setDescription(`Ссылка ${guild?.vanityURLCode ? `на [сервер](https://discord.gg/${guild.vanityURLCode})` : 'отсутствует'}`)
            .setThumbnail(client.getIcon(guild))
            .addFields(
                {
                    name: '> Владелец:',
                    value: `・${owner ? owner.user.toString() : `<@!${guild.ownerId}>`} \n・${owner ? owner.user.username : 'Неизвестно'} \n・${owner ? owner.user.id : guild.ownerId}`,
                    inline: true
                },
                {
                    name: '> Участников:',
                    value: `\`\`\`yaml\n${guild.memberCount}\`\`\``,
                    inline: false
                }
            )
            .setFooter({
                text: `ID: ${guild.id}・Серверов: ${guilds.size}`
            })
            .setTimestamp()

            const ctx = { channelId: client.config.logger.guildCreate, message: { embeds: [embed] } }
            const channel = client.channels.cache.get(ctx.channelId)
            if (channel && channel.isTextBased()) {
                return (channel as TextChannel).send(ctx.message)
        }
    }
}