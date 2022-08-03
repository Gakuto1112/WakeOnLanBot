import { ShutdownButtonCommand } from "./ShutdownButton";

export class RebootButtonCommand extends ShutdownButtonCommand {
	protected readonly COMMAND: string = "shutdown /r /t 60 /c \"マジックパケット送信Botにより再起動が実行されました。\"";
	protected readonly DONE_MESSAGE: string = "コンピューターを再起動します。"
}