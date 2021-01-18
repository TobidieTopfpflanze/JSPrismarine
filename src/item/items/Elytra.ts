import Armor from '../Armor';
import { ItemIdsType } from '../ItemIdsType';

export default class Elytra extends Armor {
    public constructor() {
        super({
            name: 'minecraft:diamond_chestplate',
            id: ItemIdsType.Elytra
        });
    }

    getMaxDurability() {
        return 432;
    }
}
