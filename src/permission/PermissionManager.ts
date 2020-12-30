import fs from 'fs';
import path from 'path';
import util from 'util';
import CommandExecuter from '../command/CommandExecuter';
import playerToggleOperatorEvent from '../events/player/PlayerToggleOperatorEvent';
import type Server from '../Server';

interface OpType {
    name: string;
}

export default class PermissionManager {
    private readonly server: Server;
    private readonly ops: Set<string> = new Set();
    private readonly permissions: Map<string, string> = new Map();

    public constructor(server: Server) {
        this.server = server;
    }

    public async onEnable(): Promise<void> {
        await this.parseOps();
    }

    public async onDisable(): Promise<void> {
        this.ops.clear();
        this.permissions.clear();
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
        const target = this.server.getPlayerByName(username);
        if (target) {
            const event = new playerToggleOperatorEvent(target, op);
            this.server.getEventManager().post(['playerToggleOperator', event]);
            if (event.cancelled) return false;
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

    public can(executer: CommandExecuter): any {
        return {
            execute: async (permission?: string) => {
                if (!permission) return true;
                if (this.isOp(executer.getUsername())) return true;
                if (!executer.isPlayer()) return true;

                // TODO: handle permissions
            }
        };
    }
}
