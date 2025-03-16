import { Collection, ContextMenuCommandBuilder, type ChatInputApplicationCommandData } from "discord.js";
import { readdirSync } from "fs";
import EmbedBuilder from "./storage/EmbedBuilder";
import Client from "#client";
import ComponentBuilder from "./storage/ComponentBuilder";
import CollectorBuilder from "./storage/CollectorBuilder";

export default class DiscordStorage {
    readonly cache = {
        slashCommands: new Collection<string, { options: ChatInputApplicationCommandData, run: Function }>(),
        contextCommands: new Collection<string, { options: ContextMenuCommandBuilder, run: Function }>(),
        messageCommands: new Collection<string, { name: string, dev?: boolean; aliases?: string[], run: Function }>(),
        buttons: new Collection<string, { name: string, run: Function }>(),
        modals: new Collection<string, { name: string, run: Function }>(),
    }

    constructor(
        private client: Client
    ) {
        this.embeds = new EmbedBuilder(this.client)
        this.components = new ComponentBuilder(this.client)
        this.collectors = new CollectorBuilder(this.client)
    }

    init(client: Client) {
        this.loadEvents(client)
        this.loadSlashCommands()
        this.loadContextCommands()
        this.loadMessageCommands()
        this.loadButtons()
        this.loadModals()
    }

    getButton(search: string) {
        return this.cache.buttons.get(search) || this.cache.buttons.find((i) => search.startsWith(i.name)) || this.cache.buttons.find((i) => search.endsWith(i.name))
    }

    getModals(search: string) {
        return this.cache.modals.get(search) || this.cache.modals.find((i) => search.startsWith(i.name)) || this.cache.modals.find((i) => search.endsWith(i.name))
    }

    embeds: EmbedBuilder
    components: ComponentBuilder
    collectors: CollectorBuilder

    private loadEvents(client: Client, folder: string = `${import.meta.dirname}/../../app/Events`) {
        for (const file of readdirSync(folder)) {
            const event = (require(`${folder}/${file}`)).default
            client.on(event.name, event.run.bind(null, client))
        }
    }

    private loadSlashCommands(folder: string = `${import.meta.dirname}/../../app/Slash Commands`) {
        for (const file of readdirSync(folder)) {
            const cmd = (require(`${folder}/${file}`)).default
            this.cache.slashCommands.set(cmd.options.name, cmd)
        }
    }

    private loadContextCommands(folder: string = `${import.meta.dirname}/../../app/Context Commands`) {
        for (const file of readdirSync(folder)) {
            const cmd = require(`${folder}/${file}`).default;
            this.cache.contextCommands.set(cmd.options.name, cmd);
        }
    }

    private loadMessageCommands(folder: string = `${import.meta.dirname}/../../app/Message Commands`) {
        for (const file of readdirSync(folder)) {
            const cmd = require(`${folder}/${file}`).default;
            this.cache.messageCommands.set(cmd.name, cmd);
        }
    }

    private loadButtons(folder: string = `${import.meta.dirname}/../../app/Buttons`) {
        for (const file of readdirSync(folder)) {
            const button = (require(`${folder}/${file}`)).default
            this.cache.buttons.set(button.name, button)
        }
    }

    private loadModals(folder: string = `${import.meta.dirname}/../../app/Modals`) {
        for (const file of readdirSync(folder)) {
            const modal = (require(`${folder}/${file}`)).default
            this.cache.modals.set(modal.name, modal)
        }
    }
}