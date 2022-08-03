import {CommandBase} from "./CommandBase";
import {isPCAwake} from "../WakeOnLanBot";
import {BaseCommandInteraction, MessageActionRow, MessageButton} from "discord.js";

export class Command extends CommandBase {
	public async run(interaction: BaseCommandInteraction): Promise<void> {
		if(isPCAwake) {
			const row = new MessageActionRow();
			await interaction.reply({content: ":question: コンピューターをシャットダウンしますか？未保存のデータは失われます。ボタンは10秒後にクリック出来なくなります。", components: [row.addComponents(new MessageButton().setCustomId("shutdown_confirm").setStyle("DANGER").setLabel("シャットダウン"))]});
			const buttonTimeout: NodeJS.Timeout = setTimeout(() => {
				row.components[0].setDisabled(true);
				interaction.editReply({content: ":question: コンピューターをシャットダウンしますか？未保存のデータは失われます。", components: [row]});
			}, 10000);
			const collector = interaction.channel?.createMessageComponentCollector({filter: button => button.customId == "shutdown_confirm" && button.user.id == interaction.user.id, maxComponents: 1});
			collector?.once("collect", () => {
				clearTimeout(buttonTimeout);
				row.components[0].setDisabled(true);
				interaction.editReply({content: ":question: コンピューターをシャットダウンしますか？未保存のデータは失われます。", components: [row]});
			});
		}
		else {
			await interaction.reply(":desktop::zzz: コンピューターは起動していません。");
		}
	}
}