import type Client from "#client";

export default {
    name: 'interactionCreate',
    run: async (client: Client, interaction: any) => {
        if(interaction.isMessageContextMenuCommand()) {
            const get = client.storage.cache.contextCommands.get(interaction.commandName)
            if(!get) return
        
            return get.run(client, interaction).catch((err: any): any => {
                if(interaction.replied || interaction.deferred) {
                    client.logger.error(err)
                } else {
                    client.logger.error(err)
                }
            })
        } else if(interaction.isCommand()) {
            const get = client.storage.cache.slashCommands.get(interaction.commandName)
            if(!get) return
        
            return get.run(client, interaction).catch((err: any): any => {
                if(interaction.replied || interaction.deferred) {
                    client.logger.error(err)
                } else {
                    client.logger.error(err)
                }
            })
        } else if(interaction.isButton()) {
            const get = client.storage.getButton(interaction.customId)
            if(!get) return
    
            return get.run(client, interaction)
        } else if(interaction.isModalSubmit()) {
            const get = client.storage.getModals(interaction.customId)
            if(!get) return
    
            return get.run(client, interaction)
        }          
    }
}