import { type APIEmbed, EmbedBuilder, Guild, GuildMember } from "discord.js";
import { type TGiveaway } from "#models/GiveawaySchema";
import Client from "#client";

export default class extends EmbedBuilder {
    constructor(
        private client: Client
    ) {
        super({ color: Number(client.config.colors.default) })
    }

    defaultColor() {
        return new EmbedBuilder().setColor(this.data.color!)
    }

    loading(name: string) {
        return this.defaultColor().setAuthor({ name })
    }

    defaultStyle(member: GuildMember, title: string, description: string, options?: { target?: GuildMember, indicateTitle?: boolean }) {
        return this.defaultColor().setDescription(description ? `${member.toString()}, ${description}` : null)
        .setThumbnail(this.client.getAvatar(options?.indicateTitle ? (options?.target || member) : member))
        .setTitle(options?.indicateTitle ? `—・${title} — ${options.target ? options.target.user.username : member.user.username}` : `—・${title}`)
    }

    successType(description: string | null) {
        return this.setColor(this.client.config.colors.success).setDescription(description ? `> ${this.client.config.emojis.success} ${description}` : null)
    }

    warningType(description: string | null) {
        return this.setColor(this.client.config.colors.warning).setDescription(description ? `> ${this.client.config.emojis.warning} ${description}` : null)
    }

    notfoundType(description: string | null) {
        return this.setColor(this.client.config.colors.notfound).setDescription(description ? `> ${this.client.config.emojis.notfound} ${description}` : null)
    }

    errorType(description: string | null) {
        return this.setColor(this.client.config.colors.error).setDescription(description ? `> ${this.client.config.emojis.error} ${description}` : null)
    }

    image(imgUrl: string) {
        return this.defaultColor().setImage(imgUrl)
    }

    copy(data: APIEmbed) {
        return new EmbedBuilder(data)
    }

    title(title: string) {
        return this.defaultColor().setTitle(`—・${title}`)
    }
    
    guilds(guilds: Guild[], page: number = 0) {
        const embed = this.title(`Сервера ${this.client.user.username}`)
            .setFooter({ text: `Страница: ${page + 1}/${this.client.getMaxPage(guilds, 5)}` })
            .setThumbnail(this.client.getBotAvatar(this.client) || null)
    
        const totalGuilds = `**・**Всего серверов: **${guilds.length}**`
        const totalUsers = `**・**Всего участников: **${guilds.reduce((n, g) => n + g.memberCount, 0)}**`
    
        let serverList = ''
        for (let i = page * 5; i < guilds.length && i < 5 * (page + 1); i++) {
            const g = guilds[i]
            const mCount = this.client.razbitNumber(g.memberCount);
            serverList += `**${i + 1}.** ${g?.vanityURLCode ? `[${g.name}](https://discord.gg/${g.vanityURLCode})` : g.name} — **${mCount}**\n`
        }
    
        embed.setDescription(`${totalGuilds}\n${totalUsers}`)
        embed.addFields([
            { name: '> Сервера:', value: serverList || 'Нет серверов', inline: false }
        ])
    
        return embed
    }

    guildsInfo(guild: Guild) {
        return this.title(guild.name)
            .setThumbnail(guild.iconURL())
            .setURL(guild.vanityURLCode ? `https://discord.gg/${guild.vanityURLCode}` : null)
            .setDescription(`**・** Владелец: <@!${guild.ownerId}> \n**・**Пользователей: **${guild.memberCount}** \n**・** Каналов: **${guild.channels.cache.size}** \n**・** Ролей: **${guild.roles.cache.size}**`)
            .setFooter({ text: `ID: ${guild.id}` })
            .setTimestamp(guild.createdTimestamp)
    }
    
    giveawayHoist(guild: Guild, doc: TGiveaway) {
        const member = guild.members.cache.get(doc.userId)

        let joinGuild: Guild | undefined = undefined
        if(doc.useJoinGuildId) {
            joinGuild = this.client.guilds.cache.get(doc.useJoinGuildId)
        }

        const embed = this.title(`Розыгрыш — ${doc.name}`).setDescription(
            `${this.client.config.emojis.dot}Организатор: ${member ? member.toString() : `**${doc.userId}**`}`
            + (joinGuild ? `\n${this.client.config.emojis.dot}Спонсор: <@!${joinGuild.ownerId}>` : '') + '\n'
            + `${this.client.config.emojis.dot}Победителей: **${doc.countWinner}**` + '\n'
            + `${this.client.config.emojis.dot}Закончится: **<t:${Math.round(doc.endTimestamp / 1000)}:R>**` + '\n'
        )

        if(doc.useVoice || doc.useJoinGuildId || doc.description) {
            embed.addFields(
                {
                    name: '> Условия:',
                    value: (
                        (doc.useVoice ? `**・**Находиться в голосовом канале\n` : '')
                        + (doc.useJoinGuildId ? `**・**Присоединиться на сервер спонсора\n` : '')
                        + (doc.description ? `**・**${doc.description}` : '')
                    )
                }
            )
        }

        return [ embed ]
    }

    giveawayEnd(guild: Guild, doc: TGiveaway) {
        const member = guild.members.cache.get(doc.userId)

        let joinGuild: Guild | undefined = undefined
        if(doc.useJoinGuildId) {
            joinGuild = this.client.guilds.cache.get(doc.useJoinGuildId)
        }

        const embed =  this.title(`Розыгрыш — ${doc.name}`).setDescription(
            `${this.client.config.emojis.dot}Организатор: ${member ? member.toString() : `**${doc.userId}**`}`
            + (joinGuild ? `\n${this.client.config.emojis.dot}Спонсор: <@!${joinGuild.ownerId}>` : '') + '\n'
            + `${this.client.config.emojis.dot}Победител${doc.countWinner === 1 ? 'ь' : 'и'}: ${doc.winners.length === 0 ? '**нет**' : doc.winners.map((id) => `<@!${id}>`).join(', ')}`
        )

        if(doc.useVoice || doc.useJoinGuildId || doc.description) {
            embed.addFields(
                {
                    name: '> Условия:',
                    value: (
                        (doc.useVoice ? `**・**Находиться в голосовом канале\n` : '')
                        + (doc.useJoinGuildId ? `**・**Присоединиться на сервер спонсора\n` : '')
                        + (doc.description ? `**・**${doc.description}` : '')
                    )
                }
            )
        }

        return [ embed ]
    }

    giveawayListMembers(member: GuildMember, doc: TGiveaway, page: number = 0) {
        const embed = this.title(`Список участников розыгрыша`)
        .setFooter({ text: `Страница: ${page+1}/${this.client.getMaxPage(doc.members, 10)}` })
        
        let text = ''
        for (let i = page*10; (i < doc.members.length && i < 10*(page+1)); i++) {
            const target = member.guild.members.cache.get(doc.members[i])
            text += `**${i+1}.** ${target ? target.toString() : doc.members[i]} ${doc.winners.includes(doc.members[i]) ? '**(Победитель)**' : ''}` + '\n'
        }

        return embed.setDescription(text || 'Пусто')
    }
}