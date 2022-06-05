import { Interaction, BaseCommandInteraction } from "discord.js";

const fs = require("fs");
const {exec} = require("child_process");
const {Client, Intents} = require("discord.js");
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
const colors: {[key: string]: string} = {black:"\u001b[30m", red: "\u001b[31m", green: "\u001b[32m", yellow: "\u001b[33m", blue: "\u001b[34m", magenta: "\u001b[35m", cyan: "\u001b[36m", white: "\u001b[37m", reset: "\u001b[0m"}; //標準出力に色を付ける制御文字

//設定ファイルの存在確認
console.info("Settings.jsonを読み込んでいます...");
let settings: {[key: string]: any}; //設定ファイルからの設定情報
try {
	settings = JSON.parse(fs.readFileSync("Settings.json", "utf-8"));
}
catch(error: any) {
	if(error.code == "ENOENT") {
		console.error(colors.red + "Settings.jsonが存在しません。" + colors.reset);
		const settingsPattern: {[key: string]: any} = {token: "<Botのトークン>", targetIPAddress: "<リモートで起動させるPCのプライベートIPアドレス（例：192.168.x.x）>", targetMacAddress: "<リモートで起動させるPCのMACアドレス（例：xx:xx:xx:xx:xx:xx）>", deviceName: "<リモートで起動させるPCの名前>"};
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
client.once("ready", () => {
	console.info(colors.green + client.user.tag + colors.reset + "でログインしました。\n終了するにはウィンドウを閉じるか、Ctrl + Cを押して下さい。");

	//コマンド登録
	client.application.commands.set([{name: "wol", description: "リモートからPCを起動します。"}], "863035320052482068");

	//1分おきにping問い合わせ
	function ping(): void {
		//ping問い合わせ
		console.info("ping問い合わせを行っています...");
		exec("ping " + settings.targetIPAddress + " -c 5", (error: Error, stdout: string, stderr: string) => {
			const pingRegExp: RegExp = new RegExp("\\d+ received");
			if(pingRegExp.test(stdout)) {
				if(Number(/\d+/.exec(pingRegExp.exec(stdout)![0])![0]) >= 1) console.log("作動しています。");
				else console.log("停止しています。");
			}
		});
	}
	ping();
	setInterval(() => ping(), 60000);
});

//コマンドの応答
client.on("interactionCreate", async (interaction: Interaction) => {
	if(interaction.isCommand()) {
		switch((interaction as BaseCommandInteraction).commandName) {
			case "wol":
				console.info("マジックパケットを送信します。");
				await (interaction as BaseCommandInteraction).reply(":loudspeaker: マジックパケットを送信します");
				exec("sudo etherwake " + settings.targetMacAddress, async (error: Error, stdout: string, stderr: string) => {
					if(error) {
						console.error(colors.red + "マジックパケットの送信に失敗しました。" + colors.reset + "\n" + stderr);
						await (interaction as BaseCommandInteraction).followUp(":x: マジックパケットの送信に失敗しました\n" + stderr);
					}
				});
				break;
		}
	}
});