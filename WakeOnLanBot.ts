import fs from "node:fs";
import child_process from "child_process";
import {Client, Intents, Interaction, BaseCommandInteraction, ButtonInteraction} from "discord.js";
import * as ssh from "ssh2";
import iconv from "iconv";
import {WolCommand} from "./commands/Wol";
import {Command} from "./commands/Command";
import {ButtonCommand} from "./commands/ButtonCommand";
import {ShutDownCommand} from "./commands/Shutdown";
import {ShutdownButtonCommand} from "./commands/ShutdownButton";
import {RebootCommand} from "./commands/Reboot";
import {RebootButtonCommand} from "./commands/RebootButton";

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
export const colors: {[key: string]: string} = {black:"\u001b[30m", red: "\u001b[31m", green: "\u001b[32m", yellow: "\u001b[33m", blue: "\u001b[34m", magenta: "\u001b[35m", cyan: "\u001b[36m", white: "\u001b[37m", reset: "\u001b[0m"}; //標準出力に色を付ける制御文字

//SSHコマンドを実行する。
export async function execSSHCommand(command: string, successCallback: Function = (stdout: string) => {}, errorCallback: Function = (stderr: string) => {}) {
	const client = new ssh.Client();
	client.once("ready", () => {
		client.exec(command, (error: Error | undefined, stream: ssh.Channel) => {
			let alreadyCallBackRunned: boolean = false;
			if(error) {
				console.group(colors.red + "SSH接続でエラーが発生しました。\n\t" + colors.reset);
				console.error(error.message);
				console.groupEnd();
			}
			stream.once("close", () => {
				if(!alreadyCallBackRunned) successCallback("");
				client.end();
			});
			stream.stdout.once("data", (data: Buffer) => {
				alreadyCallBackRunned = true;
				successCallback(new iconv.Iconv("shift-jis", "utf-8").convert(data).toString());
			});
			stream.stderr.once("data", (data: Buffer) => {
				alreadyCallBackRunned = true;
				errorCallback(new iconv.Iconv("shift-jis", "utf-8").convert(data).toString());
			});
		});
	});
	client.on("error", (error: any) => {
		if(error.errno != -104) {
			console.group(colors.red + "SSH接続でエラーが発生しました。\n\t" + colors.reset);
			console.error(error.message);
			console.groupEnd();
		}
	});
	client.connect({host: settings.targetIPAddress, port: settings.port, username: settings.userName, privateKey: fs.readFileSync(settings.privateKeyFile)});
}

//設定ファイルの存在確認
console.info("Settings.jsonを読み込んでいます...");
export let settings: {[key: string]: any}; //設定ファイルからの設定情報
try {
	settings = JSON.parse(fs.readFileSync("Settings.json", "utf-8"));
}
catch(error: any) {
	if(error.code == "ENOENT") {
		console.error(colors.red + "Settings.jsonが存在しません。" + colors.reset);
		const settingsPattern: {[key: string]: any} = {token: "<Botのトークン>", targetIPAddress: "<リモートで起動させるコンピューターのプライベートIPアドレス（例：192.168.x.x）>", targetMacAddress: "<リモートで起動させるコンピューターのMACアドレス（例：xx:xx:xx:xx:xx:xx）>", deviceName: "<リモートで起動させるコンピューターの名前>", userName: "ssh接続におけるユーザー名", port: "ssh接続で使用するポート番号、デフォルトは22", privateKeyFile: "秘密鍵ファイルへのパス"};
		try {
			fs.writeFileSync("Settings.json", JSON.stringify(settingsPattern, null, 4));
		}
		catch(error: any) {
			if(error.code == "EPERM") console.error(colors.red + "Settings.jsonを生成しようと試みましたが、書き込み権限がないので生成できません。" + colors.reset);
			else console.error(colors.red + "Settings.jsonを生成しようと試みましたが、生成できませんでした。");
			process.exit(1);
		}
		console.info("Settings.jsonを生成しました。ファイルを開いて必要な情報を入力して下さい。");
		process.exit(0);
	}
	else if(error.code == "EPERM") {
		console.error(colors.red + "Settings.jsonの読み取り権限がありません。" + colors.reset);
		process.exit(1);
	}
	else if(error instanceof SyntaxError) {
		console.error(colors.red + "Settings.jsonの構文が不正です。" + colors.reset);
		process.exit(1);
	}
	else {
		console.error(colors.red + "Settings.jsonを読み込めません。" + colors.reset);
		process.exit(1);
	}
}
console.info("Settings.jsonを読み込みました。");

//設定値の検証
console.info("設定値の検証をしています...");
let settingsError: boolean = false;
function printSettingsError(message: string): void {
	//設定値の検証時にエラーを出力する。
	console.error(colors.red + message + colors.reset);
	settingsError = true;
}
//Botのトークン
if(typeof(settings.token) != "string") printSettingsError("トークンの設定が不正です。");
//IPアドレス
if(!/^(\d{1,3}\.){3}\d{1,3}$/.test(settings.targetIPAddress)) printSettingsError("IPアドレスの設定が不正です。");
//MACアドレス
if(!/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/.test(settings.targetMacAddress)) printSettingsError("MACアドレスの設定が不正です。");
//ユーザー名
if(typeof(settings.userName) != "string") printSettingsError("ユーザー名の設定が不正です。");
//ポート番号
if(typeof(settings.port) == "number") {
	if(Number.isInteger(settings.port)) {
		if(settings.port < 1 || settings.port > 65535) printSettingsError("ポート番号は1から65535の範囲内である必要があります。");
	}
	else printSettingsError("ポート番号は整数である必要があります。");
}
else printSettingsError("ポート番号の設定が不正です。");
//秘密鍵ファイル
if(typeof(settings.privateKeyFile) == "string") {
	try {
		fs.accessSync(settings.privateKeyFile, fs.constants.R_OK);
	}
	catch(error: any) {
		switch(error.code) {
			case "ENOENT":
				printSettingsError("秘密鍵ファイルが存在しません。");
				break;
			case "EPERM":
				printSettingsError("秘密鍵ファイルの読み取り権限がありません。");
				break;
			default:
				printSettingsError("秘密鍵ファイルを読み込めません。");
				break;
		}
	}
}
else printSettingsError("秘密鍵ファイルのパスの設定が不正です。");
//検証完了のメッセージ
if(settingsError) {
	console.info("設定ファイルを検証したところ、エラーが見つかりました。修正して下さい。");
	process.exit(1);
}
else console.info("設定ファイルを検証しました。エラーは見つかりませんでした。");

//Botへのログイン
console.info("Botにログインしています...");
client.login(settings.token).catch((error: any) => {
	switch(error.name) {
		case "Error [TOKEN_INVALID]":
			console.error(colors.red + "トークンが無効です。" + colors.reset);
			break;
		case "Error [DISALLOWED_INTENTS]":
			console.error(colors.red + "インテントが無効または許可されていません。" + colors.reset);
			break;
	}
	process.exit(1);
});

//Botがログインした時のイベント
let commands: {[key: string]: Command};
let buttonCommands: {[key: string]: ButtonCommand};
export let isPCAwake: boolean = false; //PCが起動しているかどうか
client.once("ready", () => {
	console.info(colors.green + client.user!.tag + colors.reset + "でログインしました。\n終了するにはウィンドウを閉じるか、Ctrl + Cを押して下さい。");

	//コマンドの読み込み
	commands = {wol: new WolCommand(), shutdown: new ShutDownCommand(), reboot: new RebootCommand()};
	buttonCommands = {shutdown_confirm: new ShutdownButtonCommand(), reboot_confirm: new RebootButtonCommand()};

	//コマンド登録
	client.application!.commands.set([{name: "wol", description: "リモートからコンピューターを起動します。"}, {name: "shutdown", description: "コンピューターをシャットダウンします。"}, {name: "reboot", description: "コンピューターを再起動します。"}], "863035320052482068");

	//1分おきにping問い合わせ
	function ping(): void {
		//ping問い合わせ
		console.info("ping問い合わせを行っています...");
		child_process.exec("ping " + settings.targetIPAddress + " -c 5", (error: child_process.ExecException | null, stdout: string, stderr: string) => {
			const pingRegExp: RegExp = new RegExp("\\d+ received");
			if(error) {
				if(pingRegExp.test(stderr)) {
					console.info("対象のデバイスは停止しています。");
					isPCAwake = false;
					client.user!.setActivity();
				}
				else {
					console.group(colors.red + "pingコマンド実行中にエラーが発生しました。" + colors.reset);
					console.error(stdout);
					console.groupEnd();
					isPCAwake = false;
					client.user!.setActivity();
				}
			}
			else {
				console.info("対象のデバイスは作動しています。");
				isPCAwake = true;
				client.user!.setActivity({name: settings.deviceName, type: 0});
			}
		});
	}
	ping();
	setInterval(() => ping(), 60000);
});

//コマンドの応答
client.on("interactionCreate", async (interaction: Interaction) => {
	if(interaction.isCommand()) {
		if(commands[(interaction as BaseCommandInteraction).commandName]) {
			await commands[(interaction as BaseCommandInteraction).commandName].run(interaction as BaseCommandInteraction);
		}
		else {
			console.error(colors.red + "\"" + (interaction as BaseCommandInteraction).commandName + "\"に対応するモジュールが存在しません。" + colors.reset);
			await (interaction as BaseCommandInteraction).reply(":x: 送信されたコマンドに対応するモジュールが存在しません。\n");
		}
	}
	else if(interaction.isButton()) {
		if(buttonCommands[(interaction as ButtonInteraction).customId]) {
			await buttonCommands[(interaction as ButtonInteraction).customId].run(interaction as ButtonInteraction);
		}
		else {
			console.error(colors.red + "\"" + (interaction as ButtonInteraction).customId + "\"に対応するモジュールが存在しません。" + colors.reset);
			await (interaction as ButtonInteraction).reply(":x: 送信されたコマンドに対応するモジュールが存在しません。\n");
		}
	}
});