import CommandParameter, {
    CommandParameterType
} from '../../network/type/CommandParameter';

import Command from '../Command';
import Player from '../../player/Player';

export default class BanCommand extends Command {
    constructor() {
        super({
            id: 'minecraft:ban',
            description: 'Ban a player.',
            permission: 'minecraft.command.ban'
        } as any);

        this.parameters = [new Set()];

        this.parameters[0].add(
            new CommandParameter({
                name: 'target',
                type: CommandParameterType.Target,
                optional: false
            })
        );
    }

    public async execute(sender: Player, args: any[]): Promise<string | void> {
        if (args.length <= 0) {
            await sender.sendMessage('§cYou have to specify a target.');
            return;
        }

        const target = sender.getServer().getPlayerByName(args[0]);

        await sender
            .getServer()
            .getBanManager()
            .setBanned(
                args[0],
                args.length > 1 ? args.slice(1).join(' ') : undefined
            );

        if (target)
            await target.kick(
                `You have been banned${
                    args.length > 1
                        ? ` for reason: ${args.slice(1).join(' ')}`
                        : ''
                }!`
            );

        return `Banned ${args[0] || sender.getUsername()} ${
            args.length > 1 ? `for reason ${args.slice(1).join(' ')}` : ''
        }`;
    }
}
