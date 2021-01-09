import Solid from '../Solid';
import Item from '../../item/Item';
import Server from '../../Server';
import { ItemTieredToolType } from '../../item/ItemTieredToolType';
import { BlockIdsType } from '../BlockIdsType';
import { BlockToolType } from '../BlockToolType';

export enum StoneType {
    Stone = 0,
    Granite = 1,
    PolishedGranite = 2,
    Diorite = 3,
    PolishedDiorite = 4,
    Andesite = 5,
    PolishedAndesite = 6
}

export default class Stone extends Solid {
    constructor(name = 'minecraft:stone', type: StoneType = StoneType.Stone) {
        super({
            name,
            id: BlockIdsType.Stone,
            hardness: 1.5
        });
        this.meta = type;
    }

    public getToolType() {
        return BlockToolType.Pickaxe;
    }

    public getToolHarvestLevel() {
        return ItemTieredToolType.Wood;
    }

    public getDropsForCompatibleTool(item: Item, server: Server) {
        return [server.getBlockManager().getBlock('minecraft:cobblestone')];
    }
}
