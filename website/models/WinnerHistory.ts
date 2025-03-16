import mongoose from 'mongoose';

const WinnerHistorySchema = new mongoose.Schema({
    giveawayName: String,
    winners: [String],
    guildName: String,
    prize: String,
    endedAt: String,
    totalParticipants: Number,
    createdAt: { type: Date, default: Date.now }
});

export const WinnerHistory = mongoose.model('WinnerHistory', WinnerHistorySchema); 