import CommandExecuter from '../command/CommandExecuter';
import Player from '../player/Player';
import type Server from '../Server';
import fs from 'fs';
import path from 'path';
import playerToggleOperatorEvent from '../events/player/PlayerToggleOperatorEvent';
import util from 'util';

interface OpType {
    name: string;
}

export default class PermissionManager {
    private readonly server: Server;
    private readonly ops: Set<string> = new Set();
    private readonly permissions: Map<string, string[]> = new Map();
    private defaultPermissions: string[] = [];

    public constructor(server: Server) {
        this.server = server;
    }

    public async onEnable(): Promise<void> {
        await this.parseOps();
        await this.parsePermissions();
    }

    public async onDisable(): Promise<void> {
        this.ops.clear();
        this.permissions.clear();
        this.defaultPermissions = [];
    }

    public async getPermissions(player: Player): Promise<string[]> {
        return (
            this.permissions.get(player.getUsername()) ??
            this.defaultPermissions
        );
    }

    private async parsePermissions(): Promise<void> {
        try {
            if (!fs.existsSync(path.join(process.cwd(), '/permissions.json'))) {
                this.server
                    .getLogger()
                    .warn(
                        `Failed to load operators list!`,
                        'PermissionManager/parsePermissions'
                    );
                fs.writeFileSync(
                    path.join(process.cwd(), '/permissions.json'),
                    JSON.stringify(
                        {
                            defaultPermissions: [
                                'minecraft.command.help',
                                'minecraft.command.list',
                                'minecraft.command.me',
                                'jsprismarine.command.plugins',
                                'jsprismarine.command.version',
                                'jsprismarine.command.tps'
                            ],
                            players: [
                                {
                                    name: 'filfat',
                                    permissions: ['*']
                                }
                            ]
                        },
                        null,
                        4
                    )
                );
            }

            const readFile = util.promisify(fs.readFile);
            const permissionsObject: {
                defaultPermissions: string[];
                players: Array<{
                    name: string;
                    permissions: string[];
                }>;
            } = JSON.parse(
                (
                    await readFile(
                        path.join(process.cwd(), '/permissions.json')
                    )
                ).toString()
            );

            this.defaultPermissions = permissionsObject.defaultPermissions;
            permissionsObject.players.map((player) =>
                this.permissions.set(
                    player.name,
                    player.permissions.length <= 0
                        ? this.defaultPermissions
                        : player.permissions
                )
            );
        } catch (error) {
            this.server
                .getLogger()
                .error(error, 'PermissionManager/parsePermissions');
            throw new Error(`Invalid permissions.json file.`);
        }
    }

    private async parseOps(): Promise<void> {
        try {
            if (!fs.existsSync(path.join(process.cwd(), '/ops.json'))) {
                this.server
                    .getLogger()
                    .warn(
                        `Failed to load operators list!`,
                        'PermissionManager/parseOps'
                    );
                fs.writeFileSync(path.join(process.cwd(), '/ops.json'), '[]');
            }

            const readFile = util.promisify(fs.readFile);
            const ops: OpType[] = JSON.parse(
                (
                    await readFile(path.join(process.cwd(), '/ops.json'))
                ).toString()
            );

            ops.map((op) => this.ops.add(op.name));
        } catch (error) {
            this.server.getLogger().error(error, 'PermissionManager/parseOps');
            throw new Error(`Invalid ops.json file.`);
        }
    }

    public async setOp(username: string, op: boolean): Promise<boolean> {
        const target = this.server.getPlayerManager().getPlayerByName(username);
        if (target) {
            const event = new playerToggleOperatorEvent(target, op);
            this.server.getEventManager().post(['playerToggleOperator', event]);
            if (event.cancelled) return false;

            await target.getConnection().sendAvailableCommands();
        }

        if (op) this.ops.add(username);
        else this.ops.delete(username);

        const writeFile = util.promisify(fs.writeFile);
        try {
            await writeFile(
                path.join(process.cwd(), '/ops.json'),
                JSON.stringify(
                    Array.from(this.ops.values()).map((name) => ({
                        name,
                        level: 4
                    })),
                    null,
                    4
                )
            );

            if (target) await target.sendSettings();
            return true;
        } catch {
            return false;
        }
    }

    public isOp(username: string): boolean {
        return this.ops.has(username);
    }

    public can(executer: CommandExecuter) {
        return {
            execute: (permission?: string) => {
                if (!permission) return true;
                if (!executer.isPlayer()) return true;
                // TODO: investigate if we should add a "defaultOpPermissions" instead
                if (executer.isOp()) return true;

                // TODO: Recursive check, because some permissions might have sub-actions
                const [namespace, scope] = permission.split('.');

                if ((executer as Player).getPermissions().includes('*'))
                    return true;

                if (
                    (executer as Player)
                        .getPermissions()
                        .includes(`${namespace}.*`)
                )
                    return true;
                if (
                    (executer as Player)
                        .getPermissions()
                        .includes(`${namespace}.${scope}.*`)
                )
                    return true;
                if ((executer as Player).getPermissions().includes(permission))
                    return true;

                // TODO: handle permissions
                return false;
            }
        };
    }
}
