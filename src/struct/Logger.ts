import type Client from "#client";
import moment from "moment-timezone";
import chalk from "chalk";

export default class NiakoLogger {
    log(content: any) {
        console.log(
            this.getTime() + ' [' + chalk.yellow('Log') + ']: ' + content
        )
    }

    error(content: any, type?: string) {
        return console.log(
            this.getTime() + ' [' + chalk.red(type || 'Error') + ']: ' + content
        )
    }

    connect(content: any) {
        console.log(
            this.getTime() + ' [' + chalk.green('Connect') + ']: ' + content
        )
    }

    BotConnect(client: Client) {
        return this.connect(`Bot ${client.user?.tag} successfully logged in`)
    }

    databaseConnect() {
        return this.connect(`MongoDB service successfully initialized`)
    }

    private getTime() {
        return `[${chalk.cyan(moment(Date.now()).tz('Europe/Moscow').locale('ru-RU').format('YYYY.MM.DD | HH:mm:ss'))}]`
    }
}