import { Document, Schema, SchemaTypes, model } from "mongoose";
import { type IGiveawaySchema } from "#types/models/GiveawaySchema";

export type TGiveaway = IGiveawaySchema & Document

export const GiveawaySchema =  model<IGiveawaySchema>(
    'Giveaway',
    new Schema(
        {
            guildId: { type: SchemaTypes.String, required: true },
            userId: { type: SchemaTypes.String, required: true },
            channelId: { type: SchemaTypes.String, required: true },
            messageId: { type: SchemaTypes.String, required: true },
            name: { type: SchemaTypes.String, required: true },

            isActive: { type: SchemaTypes.Boolean, default: true },
            countWinner: { type: SchemaTypes.Number, required: true },

            description: { type: SchemaTypes.String, default: '' },
            useVoice: { type: SchemaTypes.Boolean, default: false },
            useJoinGuildId: { type: SchemaTypes.String, default: '' },
            inviteUrl: { type: SchemaTypes.String, default: '' },

            members: { type: [], default: [] },
            winners: { type: [], default: [] },

            endTimestamp: { type: SchemaTypes.Number, required: true },
            createdTimestamp: { type: SchemaTypes.Number, required: true }
        }
    ),
    'giveaways'
)