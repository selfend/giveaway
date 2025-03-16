import { GiveawaySchema, type TGiveaway } from "./GiveawaySchema";
import { Collection, Guild, TextChannel } from "discord.js";
import type Client from "#client";
import path from 'path';

let broadcastGiveawayWinner: any;
try {
    const websiteServer = require(path.join(process.cwd(), 'website', 'server'));
    broadcastGiveawayWinner = websiteServer.broadcastGiveawayWinner;
} catch (error) {
    console.error('Ошибка импорта веб-сервера:', error);
    broadcastGiveawayWinner = () => {}; 
}

export class GiveawayManager {
    private readonly cache: Collection<string, TGiveaway> = new Collection()
    public readonly checkSweeper: number = 15000
    
    constructor(
        private client: Client
    ) {}

    async init() {
        const array = await this.array()

        for ( let i = 0; array.length > i; i++ ) {
            const giveaway = array[i]
            this.cache.set(giveaway.messageId, giveaway)
        }

        await this.sweeper()
        this.client.logger.databaseConnect()
        setInterval(() => this.sweeper(), this.checkSweeper)
    }

    async array(cache: boolean = false, options: { isActive?: boolean, useJoinGuildId?: string, useVoice?: boolean } = {}) {
        return (cache ? this.cache.map((c) => c) : await GiveawaySchema.find(options))
    }

    async save(document: TGiveaway) {
        const doc = await document.save()
        this.cache.set(doc.messageId, doc)
        return doc
    }

    async get(messageId: string) {
        if(this.cache.has(messageId)) {
            return this.cache.get(messageId)!
        } else {
            return (await this.find(messageId))
        }
    }

    async find(messageId: string) {
        const doc = await GiveawaySchema.findOne({ messageId })
        if(doc) this.cache.set(doc.messageId, doc)
        return doc
    }

    async create(
        options: {
            userId: string, guildId: string, channelId: string,
            messageId: string, name: string, time: number,
            countWinner: number, useVoice?: boolean, description: string,
            useJoinGuildId?: string, inviteUrl?: string
        }
    ) {
        const doc = await GiveawaySchema.create(
            { ...options, endTimestamp: Math.trunc(Date.now() + options.time), createdTimestamp: Date.now() }
        )
        return (await this.save(doc))
    }

    async sweeper() {
        const array = (await this.array(false, { isActive: true })).filter((g) => Date.now() > g.endTimestamp-this.checkSweeper)
        for ( let i = 0; array.length > i; i++ ) {
            const guild = this.client.guilds.cache.get(array[i].guildId)
            if(guild) {
                if(Date.now()+this.checkSweeper > array[i].endTimestamp) {
                    await this.checkGiveaway(guild, array[i])
                } else {
                    setTimeout(
                        () => this.checkGiveaway(guild, array[i]),
                        (array[i].endTimestamp-Date.now()) > 1000 ? array[i].endTimestamp-Date.now() : 1000
                    )
                }    
            }
        }
    }

    async checkGiveaway(guild: Guild, doc: TGiveaway | null) {
        doc = await this.get(doc!.messageId)
        if(!doc) return

        if(Date.now() >= (doc.endTimestamp-this.checkSweeper-1500) && doc.isActive) {
            const channel = guild.channels.cache.get(doc.channelId) as TextChannel
            if(!channel) return

            const message = await channel.messages.fetch(doc.messageId).catch(() => null)
            if(!message) return

            const winners = await this.getWinners(guild, doc)

            doc.winners = winners
            doc.isActive = false
            doc.markModified('winners')
            await this.save(doc)

            if(!winners.length) {
                await message.reply({
                    content: 'В розыгрыше нет участников, поэтому победитель не может быть определен'
                }) 
            } else {
                try {
                    const winnerUsernames = winners.map(id => {
                        const member = guild.members.cache.get(id);
                        return member ? member.user.username : id;
                    });

                    const winnerData = {
                        giveawayName: doc.name,
                        winners: winnerUsernames,
                        guildName: guild.name,
                        prize: doc.name,
                        endedAt: new Date().toLocaleString('ru-RU'),
                        totalParticipants: doc.members.length
                    };

                    console.log('Попытка отправки данных на веб-сайт:', winnerData);
                    
                    if (typeof broadcastGiveawayWinner === 'function') {
                        await broadcastGiveawayWinner(winnerData);
                        console.log('Данные успешно отправлены на веб-сайт');
                    } else {
                        console.error('broadcastGiveawayWinner не является функцией');
                    }

                } catch (error) {
                    console.error('Ошибка отправки на веб-сайт:', error);
                }

                await message.reply({
                    content: `Поздравляем ${winners.map(id => `<@!${id}>`).join(', ')}! ${winners.length === 1 ? 'Ты выиграл' : 'Вы выиграли'} **${doc.name}**!`
                })
            }

            return message.edit({
                embeds: this.client.storage.embeds.giveawayEnd(guild, doc),
                components: this.client.storage.components.giveawayEnd(doc)
            })
        } else {
            const channel = guild.channels.cache.get(doc.channelId) as TextChannel
            if(!channel) return

            const message = (channel.messages.cache.get(doc.messageId) || await channel.messages.fetch(doc.messageId).catch(() => undefined))
            if(!message) return

            return message.edit({
                components: this.client.storage.components.giveawayHoist(doc)
            })
        }
    }

    async getWinners(guild: Guild, doc: TGiveaway) {
        const guildMembers = await guild.members.fetch()
        const winners: string[] = []

        const members = doc.members.filter((id) => {
            const member = guildMembers.get(id)
            if(member) {
                if(doc.useVoice && doc.useJoinGuildId) {
                    if(!member?.voice?.channelId) return false

                    const joinGuild = this.client.guilds.cache.get(doc.useJoinGuildId)
                    if(!joinGuild || !joinGuild.members.cache.has(id)) return false
                } else if(doc.useVoice) {
                    return Boolean(member.voice?.channel)
                } if(doc.useJoinGuildId) {
                    const joinGuild = this.client.guilds.cache.get(doc.useJoinGuildId)
                    if(!joinGuild || !joinGuild.members.cache.has(id)) return false
                }

                return true
            }
        })

        if(doc.countWinner > members.length) {
            members.map((id) => {
                winners.push(id)
            })
        } else {
            for ( let i = 0; doc.countWinner > winners.length; i++) {
                const rnd = this.client.random(0, members.length-1)
                if(members[rnd] && !winners.includes(members[rnd])) {
                    winners.push(members[rnd])
                }
            }
        }

        return winners
    }
}