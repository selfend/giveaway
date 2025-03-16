import { Client, Guild, InviteGuild, Role, GuildMember, type ImageSize } from "discord.js";
import DiscordStorage from "./discord.js/DiscordStorage";
import mongoose from "mongoose";
import * as config from "#config";
import { GiveawayManager } from "#models/GiveawayManager";
import BotLogger from "./Logger"

export default class extends Client<true> {
    constructor() {
        super({ intents: config.internal.intents })
    }

    config = config
    storage = new DiscordStorage(this)
    giveaway = new GiveawayManager(this)
    logger = new BotLogger()

    async start() {
        console.clear()
        this.storage.init(this)
        return mongoose.connect(config.internal.mongoUrl).then(async () => {
            return this.login(config.internal.token)
        })
    }  

    getAvatar(member: GuildMember, size: ImageSize = 4096) {
        return member.displayAvatarURL({extension: 'png', forceStatic: false, size: size})
    }

    getIcon(icon: Role | Guild | InviteGuild, size: ImageSize = 4096) {
        return icon.iconURL({ extension: 'png', forceStatic: false, size: size}) || null
    }

    getBotAvatar(client: Client, size: ImageSize = 4096) {
        return client.user?.displayAvatarURL({ extension: 'png', forceStatic: false, size: size })
    }
    
    getMaxPage(array: any[], count: number) {
        return Math.ceil(array.length/count) === 0 ? 1 : Math.ceil(array.length/count)
    }

    razbitNumber(num: number) {
        return String(num).split('').reverse().map((v,i) => { if((i+1) % 3 === 0 && num.toString().length-1 !== i) { return ` ${v}` } else { return v }}).reverse().join('')
    } 

    random(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    randomElement<T>(array: T[]) {
        return array[this.random(0, array.length-1)]
    }

    lastElement<T>(array: T[]) {
        return array[array.length-1]
    }

    isNotNumber(el: string | number, options: { minChecked?: number, maxChecked?: number } = {}) {
        const num = Number(el)
        return (isNaN(num) || (options?.minChecked ? options.minChecked : 0) > num || num > (options?.maxChecked ? options.maxChecked : Infinity))
    }

    toCode(text: any, code: string = '') {
        return `\`\`\`${code}\n${text}\n\`\`\``
    }

    sleep(ms: number) {
        return new Promise((resolve, _) => setTimeout(resolve, ms))
    }
}