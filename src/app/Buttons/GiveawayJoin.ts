import { ButtonInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import type Client from "#client";

export default {
    name: 'joinGiveaway',
    run: async (client: Client, interaction: ButtonInteraction<"cached">) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const doc = await client.giveaway.get(interaction.message.id);
        if (!doc) {
            return interaction.editReply({
                embeds: [client.storage.embeds.notfoundType('Неизвестный розыгрыш')]
            })
        }     

        if(!doc.isActive) {
            return interaction.editReply({
                embeds: [client.storage.embeds.errorType('Розыгрыш **уже** закончен')]
            })
        }

        if(doc.members.includes(interaction.user.id)) {
            return interaction.editReply({
                embeds: [client.storage.embeds.warningType('Вы уже **участвуете** в этом розыгрыше!')],
                components: client.storage.components.leave(`leaveGiveaway:${doc.messageId}`, false, 'Покинуть розыгрыш')
            })
        } else {
            if(doc.useVoice) {
                if(!interaction.member.voice?.channelId) {
                    return interaction.editReply({
                        embeds: [client.storage.embeds.errorType('Вы **должны** находиться в **голосовом** канале')]
                    })
                }
            }
    
            if(doc.useJoinGuildId) {
                const guild = client.guilds.cache.get(doc.useJoinGuildId)
                if(!guild) {
                    return interaction.editReply({
                        embeds: [client.storage.embeds.notfoundType('Что-то **не** так с **сервером** спонсора')]
                    })
                }
    
                if(!guild.members.cache.has(interaction.user.id)) {
                    return interaction.editReply({
                        embeds: [client.storage.embeds.errorType('Вас **нет** на сервере спонсора')]
                    })
                }
            }

            doc.members.push(interaction.user.id)
            doc.markModified('members')
            await client.giveaway.save(doc)

            await interaction.message.edit({
                components: client.storage.components.giveawayHoist(doc)
            })

            return interaction.editReply({
                embeds: [client.storage.embeds.successType(`Tеперь Вы **участвуете** в розыгрыше на **${doc.name}**`)]
            })
        }
    }
}