import AnimatePacket from '../packet/AnimatePacket';
import Identifiers from '../Identifiers';
import PacketHandler from './PacketHandler';
import type Player from '../../player/Player';
import type Server from '../../Server';

export default class AnimateHandler implements PacketHandler<AnimatePacket> {
    public static NetID = Identifiers.AnimatePacket;

    public async handle(packet: AnimatePacket, server: Server, player: Player): Promise<void> {
        const pk = new AnimatePacket();
        pk.runtimeEntityId = player.getRuntimeId();
        pk.action = packet.action;

        await Promise.all(
            server
                .getPlayerManager()
                .getOnlinePlayers()
                .filter((onlinePlayer) => !(onlinePlayer === player))
                .map(async (otherPlayer) => otherPlayer.getConnection().sendDataPacket(pk))
        );
    }
}
