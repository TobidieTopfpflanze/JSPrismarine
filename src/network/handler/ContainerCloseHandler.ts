import type Player from '../../player/Player';
import type Prismarine from '../../Prismarine';
import ContainerClosePacket from '../packet/ContainerClosePacket';

export default class ContainerCloseHandler {
    public handle(
        packet: ContainerClosePacket,
        server: Prismarine,
        player: Player
    ): void {
        const pk = new ContainerClosePacket();
        pk.windowId = packet.windowId;
        player.getConnection().sendDataPacket(pk);

        // TODO: event
    }
}
