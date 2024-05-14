export interface TwitchChatBotCommand {
    name: string;
    text: string;
    cooldown: number;
    lastUsed: number;
    enabled: boolean;
    commandList: string;
}
