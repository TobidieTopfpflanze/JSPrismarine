import Solid from '../Solid';
import { ItemTieredToolType } from '../../item/ItemTieredToolType';
import { BlockIdsType } from '../BlockIdsType';
import { BlockToolType } from '../BlockToolType';

export default class MossyCobblestone extends Solid {
    constructor() {
        super({
            name: 'minecraft:mossy_cobblestone',
            id: BlockIdsType.MossyCobblestone,
            hardness: 2
        });
    }

    getToolType() {
        return BlockToolType.Pickaxe;
    }

    getToolHarvestLevel() {
        return ItemTieredToolType.Wood;
    }
}
