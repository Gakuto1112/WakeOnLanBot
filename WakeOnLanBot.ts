const fs = require("fs");
/*
const {Client, Intents} = require("discord.js");
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
*/
const colors: {[key: string]: string} = {black:"\u001b[30m", red: "\u001b[31m", green: "\u001b[32m", yellow: "\u001b[33m", blue: "\u001b[34m", magenta: "\u001b[35m", cyan: "\u001b[36m", white: "\u001b[37m", reset: "\u001b[0m"}; //標準出力に色を付ける制御文字


//設定ファイルの検証
let settings: {[key: string]: any} = {}; //設定ファイルからの設定情報
try {
	settings = JSON.parse(fs.readFileSync("Settings.json", "utf-8"));
}
catch(error: any) {
	if(error.code == "ENOENT") {
		console.error(colors.red + "Settings.jsonが存在しません。" + colors.reset);
		const settingsPattern: {[key: string]: any} = {token: "<Botのトークン>", targetIP: "<リモートで起動させるPCのプライベートIPアドレス（例：192.168.x.x）>", deviceName: "<リモートで起動させるPCの名前>"};
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