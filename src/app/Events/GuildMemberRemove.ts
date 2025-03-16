import { GuildMember } from "discord.js";
import type Client from "#client";

export default {
    name: 'guildMemberRemove',
    run: async (client: Client, member: GuildMember) => {
        const guilds = (await client.giveaway.array(false, { isActive: true })).filter((g) => g?.useJoinGuildId).map((g) => g.useJoinGuildId)
        if(guilds.includes(member.guild.id)) {
            const array = (
                await client.giveaway.array(false, { isActive: true })
            ).filter((g) => g.members.includes(member.id))

            for ( let i = 0; array.length > i; i++ ) {
                array[i].members.splice(array[i].members.indexOf(member.id), 1)
                array[i].markModified('members')
                await client.giveaway.checkGiveaway(member.guild, array[i])
            }
        } else {
            const array = (
                await client.giveaway.array(false, { isActive: true, useJoinGuildId: member.guild.id })
            ).filter((g) => g.members.includes(member.id))

            for ( let i = 0; array.length > i; i++ ) {
                array[i].members.splice(array[i].members.indexOf(member.id), 1)
                array[i].markModified('members')
                await client.giveaway.checkGiveaway(member.guild, array[i])
            }
        }
    }
}