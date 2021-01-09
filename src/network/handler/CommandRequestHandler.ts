import type CommandRequestPacket from '../packet/CommandRequestPacket';
import PacketHandler from './PacketHandler';
import type Player from '../../player/Player';
import type Server from '../../Server';

export default class CommandRequestHandler
    implements PacketHandler<CommandRequestPacket> {
    public async handle(
        packet: CommandRequestPacket,
        server: Server,
        player: Player
    ): Promise<void> {
        await player
            .getServer()
            .getCommandManager()
            .dispatchCommand(player, packet.commandName.slice(1));
    }
}
