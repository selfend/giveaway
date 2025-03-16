import { Message } from "discord.js";
import Client from "#client";

export default {
    name: "eval",
    aliases: ['e'],
    dev: true,
    run: async (client: Client, message: Message, args: string[]) => {
        try {
            const code = eval(args.join(' '))
            return message.reply({ content: client.toCode(code) })
        } catch {
            return message.reply({ content: `${message.author.toString()} блять все хуево и с ошибками, брат` })
        }
    }
};