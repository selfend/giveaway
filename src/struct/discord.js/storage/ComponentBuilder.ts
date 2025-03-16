import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } from "discord.js";
import { type TGiveaway } from "#models/GiveawaySchema";
import Client from "#client";

export default class ComponentBuilder {
    constructor(
        private client: Client
    ) {}
    
    private buttonPrimary(customId: string) {
        return new ButtonBuilder().setCustomId(customId).setStyle(ButtonStyle.Primary)
    }

    private buttonSecondary(customId: string) {
        return new ButtonBuilder().setCustomId(customId).setStyle(ButtonStyle.Secondary)
    }

    private buttonSuccess(customId: string) {
        return new ButtonBuilder().setCustomId(customId).setStyle(ButtonStyle.Success)
    }

    private buttonDanger(customId: string) {
        return new ButtonBuilder().setCustomId(customId).setStyle(ButtonStyle.Danger)
    }

    private buttonLink(url: string) {
        return new ButtonBuilder().setURL(url).setStyle(ButtonStyle.Link)
    }

    giveawayHoist(doc: TGiveaway) {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            this.buttonSuccess(`joinGiveaway`).setLabel('Участвовать'),
            this.buttonSecondary(`listMembers`).setLabel(`Участников — ${doc.members.length}`)
        )

        if(doc.useJoinGuildId) {
            row.addComponents(
                this.buttonLink(doc.inviteUrl).setLabel('Присоединиться'),
            )
        }

        return [ row ]
    }

    giveawayEnd(doc: TGiveaway) {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            this.buttonSecondary(`listMembers`).setLabel(`Участников — ${doc.members.length}`)
        )

        if(doc.useJoinGuildId) {
            row.addComponents(
                this.buttonLink(doc.inviteUrl).setLabel('Присоединиться'),
            )
        }

        return [ row ]
    }

    leave(customId: string = 'leave', state: boolean = false, label: string = 'Назад') {
        return [
            new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                (state ? this.buttonPrimary(customId) : this.buttonDanger(customId)).setLabel(label)
            )
        ]
    }

    paginator(array: any[], options: { page: number, count: number, trash?: boolean, extra?: boolean, ends?: string } = { page: 0, count: 10 }) {
        const row = new ActionRowBuilder<ButtonBuilder>()
        let rightIndex = 1

        if(options.extra) {
            rightIndex += 1
            row.addComponents(this.buttonSecondary(`backward${options?.ends ? options?.ends : ''}`).setEmoji(this.client.config.emojis.backward))
        }

        row.addComponents(this.buttonSecondary(`left${options?.ends ? options?.ends : ''}`).setEmoji(this.client.config.emojis.left))

        if(options.trash) {
            rightIndex += 1
            row.addComponents(this.buttonSecondary('trash').setEmoji(this.client.config.emojis.trash))
        }

        row.addComponents(this.buttonSecondary(`right${options?.ends ? options?.ends : ''}`).setEmoji(this.client.config.emojis.right))

        if(options.extra) {
            row.addComponents(this.buttonSecondary(`forward${options?.ends ? options?.ends : ''}`).setEmoji(this.client.config.emojis.forward))
        }

        const max = Math.ceil(array.length / options.count) === 0 ? 1 : Math.ceil(array.length / options.count)

        row.components[0].setDisabled(1 > options.page)
        if(options.extra) {
            row.components[1].setDisabled(1 > options.page)
        }

        row.components[rightIndex].setDisabled((options.page + 1) >= max || max === 1)
        if(options.extra) {
            row.components[rightIndex+1].setDisabled((options.page + 1) >= max || max === 1)
        }

        return [row]
    }

    guildsSelect(guilds: { name: string, id: string }[]) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId('guildsSelectInfo')
            .setPlaceholder('Выберите нужный сервер')
            .addOptions(
                guilds.map((guild) => ({
                    label: guild.name,
                    value: guild.id
                }))
            )
    
        return [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)]
    }
}