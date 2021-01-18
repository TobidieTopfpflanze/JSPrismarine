import { BlockToolType } from '../../block/BlockToolType';
import { ItemIdsType } from '../ItemIdsType';
import { ItemTieredToolType } from '../ItemTieredToolType';
import TieredTool from '../TieredTool';

export default class WoodenPickaxe extends TieredTool {
    public constructor() {
        super(
            {
                name: 'minecraft:wooden_pickaxe',
                id: ItemIdsType.WoodenPickaxe
            },
            ItemTieredToolType.Wood
        );
    }

    public getBurntime() {
        return 200;
    }

    public getMaxDurability() {
        return 60;
    }

    public getToolType() {
        return BlockToolType.Pickaxe;
    }
}
