import { ItemIdsType } from '../ItemIdsType';
import Tool from '../Tool';

export default class Shears extends Tool {
    constructor() {
        super({
            name: 'minecraft:shears',
            id: ItemIdsType.Shears
        });
    }

    getMaxDurability() {
        return 238;
    }
}
