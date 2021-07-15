import BlockPosition from '../../world/BlockPosition';
import DataPacket from './DataPacket';
import Identifiers from '../Identifiers';

export default class PlayerActionPacket extends DataPacket {
    public static NetID = Identifiers.PlayerActionPacket;

    public runtimeEntityId!: bigint;
    public action!: number;
    public position!: BlockPosition;
    public face!: number;

    public decodePayload(): void {
        this.runtimeEntityId = this.readUnsignedVarLong();
        this.action = this.readVarInt();
        this.position = BlockPosition.networkDeserialize(this);
        this.face = this.readVarInt();
    }

    public encodePayload(): void {
        this.writeUnsignedVarLong(this.runtimeEntityId);
        this.writeVarInt(this.action);
        this.position.networkSerialize(this);
        this.writeVarInt(this.face);
    }
}
