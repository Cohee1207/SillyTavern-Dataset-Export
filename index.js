jQuery(() => {
    $('<a id="option_export_dataset"><i class="fa-lg fa-solid fa-table"></i><span>Export as dataset</span></a>')
        .insertAfter('#option_select_chat')
        .on('click', async () => {
            const context = window['SillyTavern'].getContext();
            const promptStorage = new localforage.createInstance({ name: 'SillyTavern_Prompts' });
            const chatId = context.getCurrentChatId();
            if (!chatId) {
                toastr.info('Please select a chat first');
                return;
            }
            const itemizedPrompts = (await promptStorage.getItem(chatId)) || [];
            const dataset = [];
            const chat = context.chat;
            for (const message of chat) {
                if (message.is_user || message.is_system) continue;
                const itemizedPrompt = itemizedPrompts.find(x => x.mesId === chat.indexOf(message));
                if (!itemizedPrompt) {
                    console.warn(`No prompt found for message ${chat.indexOf(message)}`);
                    continue;
                }
                let prompt = itemizedPrompt.rawPrompt;
                if (Array.isArray(itemizedPrompt.rawPrompt)) {
                    prompt = itemizedPrompt.rawPrompt.map(x => (x.name || x.role) + ': ' + String(x.content)).join('\n');
                }
                dataset.push({
                    'instruction': '',
                    'input': prompt,
                    'output': message.mes,
                });
            }
            if (!dataset.length) {
                toastr.info('No exportable data found');
                return;
            }
            const blob = new Blob([JSON.stringify(dataset, null, 4)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${chatId}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
});
