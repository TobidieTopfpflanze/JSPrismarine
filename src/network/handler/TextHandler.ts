import Chat from '../../chat/Chat';
import PacketHandler from './PacketHandler';
import type Player from '../../player/Player';
import type Server from '../../Server';
import type TextPacket from '../packet/TextPacket';

export default class TextHandler implements PacketHandler<TextPacket> {
    public handle(packet: TextPacket, server: Server, player: Player): void {
        // Emit chat event
        const chat = new Chat(
            player,
            `${player.getFormattedUsername()} ${packet.message}`
        );
        server.getChatManager().send(chat);
    }
}
