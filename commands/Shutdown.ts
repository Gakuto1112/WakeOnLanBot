import {Command} from "./Command";
import {isPCAwake} from "../WakeOnLanBot";
import {BaseCommandInteraction, MessageActionRow, MessageButton} from "discord.js";

export class ShutDownCommand extends Command {
	protected readonly CONFIRM_MESSAGE: string = "コンピューターをシャットダウンしますか？未保存のデータは失われます。";
	protected readonly CONFIRM_BUTTON_ID: string = "shutdown_confirm";
	protected readonly CONFIRM_BUTTON_LABEL: string = "シャットダウン";

	public async run(interaction: BaseCommandInteraction): Promise<void> {
		if(isPCAwake) {
			const row = new MessageActionRow();
			await interaction.reply({content: ":question: " + this.CONFIRM_MESSAGE + "ボタンは10秒後にクリック出来なくなります。", components: [row.addComponents(new MessageButton().setCustomId(this.CONFIRM_BUTTON_ID).setStyle("DANGER").setLabel(this.CONFIRM_BUTTON_LABEL))]});
			const buttonTimeout: NodeJS.Timeout = setTimeout(() => {
				row.components[0].setDisabled(true);
				interaction.editReply({content: ":question: " + this.CONFIRM_MESSAGE, components: [row]});
			}, 10000);
			const collector = interaction.channel?.createMessageComponentCollector({filter: button => button.customId == this.CONFIRM_BUTTON_ID && button.user.id == interaction.user.id, maxComponents: 1});
			collector?.once("collect", () => {
				clearTimeout(buttonTimeout);
				row.components[0].setDisabled(true);
				interaction.editReply({content: ":question: " + this.CONFIRM_MESSAGE, components: [row]});
			});
		}
		else {
			await interaction.reply(":zzz: コンピューターは起動していません。");
		}
	}
}