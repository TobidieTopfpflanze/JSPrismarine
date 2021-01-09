import StainedGlass, { StainedGlassType } from './WhiteStainedGlass';

export default class BlackStainedGlass extends StainedGlass {
    constructor() {
        super('minecraft:black_stained_glass', StainedGlassType.Black);
    }
}
