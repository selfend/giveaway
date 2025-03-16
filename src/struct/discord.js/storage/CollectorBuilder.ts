import { ActionRowBuilder, CommandInteraction, InteractionCollector, Message, ButtonInteraction } from "discord.js";
import type { MessageActionRowComponentBuilder, CollectedInteraction } from "discord.js";
import Client from "#client";

type TInteractionCollectorRunEnd = (collected: any, reason: string) => Promise<any>;
type TInteractionCollectorRun = (int: CollectedInteraction<'cached'>) => Promise<any>;

export default class CollectorBuilder {

    constructor(
        private client: Client
    ) {}

    interaction(interaction: CommandInteraction<'cached'> | ButtonInteraction<'cached'> | Message<true>, message: Message, run: TInteractionCollectorRun, time: number = 60_000, endRun?: TInteractionCollectorRunEnd, max?: number) {
        const collector = new InteractionCollector(interaction.client, { message, time, max })

        collector.on('collect', async (int: CollectedInteraction<'cached'>): Promise<any> => {
            collector.resetTimer()

            if (int.user.id !== interaction.member!.id) {
                return int.deferUpdate()
            }

            await run(int).catch((err) => this.client.logger.error(err))

            if (!int.replied && !int.deferred) {
                return int.deferUpdate().catch(() => {})
            }
        })

        collector.on('end', async (collected: any, reason: string) => {
            if (!endRun && reason === 'time') {
                const msg = await message.fetch().catch(() => null)
                if (msg) {
                    const components = msg.components.map(row => {
                        const actionRow = ActionRowBuilder.from(row) as ActionRowBuilder<MessageActionRowComponentBuilder>
                        actionRow.components.forEach(component => {
                            component.setDisabled(true)
                        })

                        return actionRow
                    })

                    await msg.edit({ components }).catch(() => {})
                }
            } else if (endRun) {
                return endRun(collected, reason)
            }
        })

        return collector
    }

    message(authorId: string, message: Message<true>, run: TInteractionCollectorRun, time: number = 60_000, endRun?: TInteractionCollectorRunEnd, max?: number) {
        const collector = new InteractionCollector(message.client, { message, time, max })

        collector.on('collect', async (int: CollectedInteraction<'cached'>): Promise<any> => {
            collector.resetTimer()

            if (int.user.id !== authorId) {
                return int.deferUpdate()
            }

            await run(int).catch(() => {})

            if (!int.replied && !int.deferred) {
                return int.deferUpdate().catch(() => {})
            }
        })

        collector.on('end', async (collected: any, reason: string) => {
            if (!endRun && reason === 'time') {
                const msg = await message.fetch().catch(() => null)
                if (msg) {
                    const components = msg.components.map(row => {
                        const actionRow = ActionRowBuilder.from(row) as ActionRowBuilder<MessageActionRowComponentBuilder>
                        actionRow.components.forEach(component => {
                            component.setDisabled(true)
                        })

                        return actionRow
                    })

                    await msg.edit({ components }).catch(() => {})
                }
            } else if (endRun) {
                return endRun(collected, reason)
            }
        })

        return collector
    }
}