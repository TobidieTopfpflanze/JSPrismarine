import { BlockToolType } from '../../block/BlockToolType';
import { ItemIdsType } from '../ItemIdsType';
import { ItemTieredToolType } from '../ItemTieredToolType';
import TieredTool from '../TieredTool';

export default class WoodenAxe extends TieredTool {
    constructor() {
        super(
            {
                name: 'minecraft:wooden_axe',
                id: ItemIdsType.WoodenAxe
            },
            ItemTieredToolType.Wood
        );
    }

    getBurntime() {
        return 200;
    }

    getMaxDurability() {
        return 60;
    }

    getToolType() {
        return BlockToolType.Axe;
    }
}
