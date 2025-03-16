import { ApplicationCommandOptionType, ChannelType, CommandInteraction } from "discord.js";
import type Client from "#client";
import ms from "ms";

export default {
    options: {
        name: 'gcreate',
        description: 'Начать розыгрыш',
        defaultMemberPermissions: 'Administrator',
        options: [
            {
                name: 'название',
                description: 'Название розыгрыша',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'время',
                description: 'Как долго будет длится розыгрыш (1h|1m|1s)',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'победителей',
                description: 'Количество победителей',
                type: ApplicationCommandOptionType.Number,
                required: true
            },
            {
                name: 'канал',
                description: 'Куда отправить уведомление',
                type: ApplicationCommandOptionType.Channel
            },
            {
                name: 'войс',
                description: 'Считать только тех, кто в войсе',
                type: ApplicationCommandOptionType.String,
                choices: [
                    { name: 'Да', value: 'true' },
                    { name: 'Нет', value: 'false' }
                ]
            },
            {
                name: 'спонсор',
                description: 'Бессрочная ссылка на сервер',
                type: ApplicationCommandOptionType.String
            },
            {
                name: 'допусловия',
                description: 'Условия, которые будут перед информацией',
                type: ApplicationCommandOptionType.String
            }
        ]
    },
    run: async (client: Client, interaction:CommandInteraction<'cached'>) => {
        await interaction.deferReply()

        const useVoice = (interaction.options.get('войс')?.value || false) as boolean
        const countWinner = interaction.options.get('победителей', true).value as number
        const time = ms(interaction.options.get('время', true).value as string)
        const name = interaction.options.get('название', true).value as string
        const channel = interaction.options.get('канал')?.channel ?? interaction.channel!
        const inviteUrl = interaction.options.get('спонсор')?.value as string
        const description = interaction.options.get('допусловия')?.value as string | ''
        let useJoinGuildId = ''

        if(!time) {
            return interaction.editReply({
                embeds: [client.storage.embeds.defaultStyle(interaction.member, 'Начать розыгрыш', 'некорректное время')],
            })
        }

        if (client.isNotNumber(countWinner, { minChecked: 1, maxChecked: 100 })) {
            return interaction.editReply({
                embeds: [client.storage.embeds.defaultStyle(interaction.member, 'Начать розыгрыш', 'некорректное значение **количества** победителей')],
            })
        }

        if (channel.type !== ChannelType.GuildText) {
            return interaction.editReply({
                embeds: [client.storage.embeds.defaultStyle(interaction.member, 'Начать розыгрыш', 'канал розырышей **должен** быть **текстовым** каналом')],
            })
        }

        if (inviteUrl) {
            const data = await client.fetchInvite(inviteUrl).catch(() => null)
            if (!data) {
                return interaction.editReply({
                    embeds: [client.storage.embeds.defaultStyle(interaction.member, 'Начать розыгрыш', 'не **удалось** получить данные о сервере')],
                })
            }

            if (!data?.guild || !client.guilds.cache.has(data.guild.id)) {
                return interaction.editReply({
                    embeds: [client.storage.embeds.defaultStyle(interaction.member, 'Начать розыгрыш', 'бота **нет** на сервере спонсора')],
                })
            }

            if (data.guild.id === interaction.guild.id) {
                return interaction.editReply({
                    embeds: [client.storage.embeds.defaultStyle(interaction.member, 'Начать розыгрыш', 'укажите сервер **спонсора**')],
                })
            }

            if (data.expiresTimestamp) {
                return interaction.editReply({
                    embeds: [client.storage.embeds.defaultStyle(interaction.member, 'Начать розыгрыш', 'ссылка **не** является **бессрочной**')],
                })
            }

            useJoinGuildId = data.guild.id
        }

        const message = await channel.send({
            embeds: [client.storage.embeds.loading('Создание розыгрыша...')],
        })

        const doc = await client.giveaway.create(
            {
                userId: interaction.user.id, channelId: channel.id,
                messageId: message.id, name, time, countWinner, description,
                useVoice, useJoinGuildId, inviteUrl, guildId: interaction.guildId
            }
        )

        await message.edit({
            embeds: client.storage.embeds.giveawayHoist(interaction.guild, doc),
            components: client.storage.components.giveawayHoist(doc)
        })

        return interaction.editReply({
            embeds: [client.storage.embeds.defaultStyle(interaction.member, 'Начать розыгрыш', 'Вы **начали** розыгрыш')],
        })
    }
}