import type Client from "#client";
import { ActivityType } from "discord.js";

export default {
    name: 'ready',
    run: async (client: Client) => {

        client.user.setActivity(
            {
                name: `giveaway`,
                type: ActivityType.Watching
            }
        )

        await client.giveaway.init()
        client.logger.BotConnect(client)
        
        return client.application.commands.set(
            [
                ...client.storage.cache.slashCommands.map((c) => ({ ...c.options, dmPermission: false })),
                ...client.storage.cache.contextCommands.map((c) => ({ ...c.options, dmPermission: false }))
            ]
        )
    }
}