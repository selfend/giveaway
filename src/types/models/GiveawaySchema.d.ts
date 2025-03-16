export interface IGiveawaySchema {
    guildId: string
    userId: string
    channelId: string
    messageId: string
    name: string

    isActive: boolean
    countWinner: number

    description: string
    useVoice: boolean
    useJoinGuildId: string
    inviteUrl: string

    members: string[]
    winners: string[]

    endTimestamp: number
    createdTimestamp: number
}