import type Client from "#client";

export default {
    name: 'error',
    run: async (client: Client, error: Error) => {
        client.logger.error(error)
        if(String(error) === '{}') return
    }
}
