import { ItemIdsType } from '../ItemIdsType';
import Tool from '../Tool';

export default class FlintSteel extends Tool {
    constructor() {
        super({
            name: 'minecraft:flint_and_steel',
            id: ItemIdsType.FlintSteel
        });
    }

    getMaxDurability() {
        return 64;
    }
}
