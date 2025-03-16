import { VoiceState } from "discord.js";
import type Client from "#client";

export default {
    name: 'voiceStateUpdate',
    run: async (client: Client, oldState: VoiceState, newState: VoiceState) => {
        if(!newState?.channel && oldState?.channel) {
            const { member, guild } = oldState
            if(!member) return

            const array = (
                await client.giveaway.array(false, { isActive: true, useVoice: true })
            ).filter((g) => g.members.includes(member.id) && g.endTimestamp > Date.now()+30000)
            if(!array.length) return

            const msg = await member.send({
                embeds: [ client.storage.embeds.defaultStyle(member, `Участие в розыгрыше — ${array[0].name}`, `Вы **покинули голосовой канал** принимая участие в розыгрыше. У вас **15 секунд** времени, **чтобы вернуться** в голосовой канал.`)]
            }).catch(() => null)

            if(msg) {
                await client.sleep(15000)
            }

            const fetchMember = await member.fetch().catch(() => null)
            if(!fetchMember || !fetchMember?.voice?.channelId) {
                for ( let i = 0; array.length > i; i++ ) {
                    array[i].members.splice(array[i].members.indexOf(member.id), 1)
                    array[i].markModified('members')
                    await client.giveaway.checkGiveaway(guild, array[i])    
                }
            }
        }
    }
}