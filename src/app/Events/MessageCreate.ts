import type { Message } from "discord.js";
import type Client from "#client";

export default {
    name: "messageCreate",
    run: async (client: Client, message: Message) => {
        if (!message.guild || message?.author?.bot) return

        const args = message.content.split(" ")
        const prefixs = [`<@!${client.user.id}>`, `<@${client.user.id}>`, client.config.internal.prefix]
        const getPrefix = prefixs.find((prefix) => message.content.startsWith(prefix))
        if (!getPrefix) return

        const commandName = args[0].toLowerCase().slice(getPrefix.length)
        let command = client.storage.cache.messageCommands.get(commandName)

        if (!command) { command = [...client.storage.cache.messageCommands.values()].find(cmd => cmd.aliases?.includes(commandName)) }
        if (!command) return

        if (command.dev && message.author && !client.config.developers.includes(message.author.id)) return
        return command.run(client, message, args.slice(1))
    },
}