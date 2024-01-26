export interface SSHConfig {
    host: string;
    username: string;
    port: string;
    privateKey: string;
}

export interface Configs {
    [guildId: string]: SSHConfig;
}
