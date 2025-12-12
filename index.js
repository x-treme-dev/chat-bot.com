const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = '7854875232:AAHG0vW5wbGAnaiUByLAGabR851KCBQrmJE';
const bot = new TelegramBot(token, { polling: true });

const languages = JSON.parse(fs.readFileSync('languages.json'));
const frameworks = JSON.parse(fs.readFileSync('frameworks.json'));

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    sendLanguages(chatId, 'Привет! Я бот, который поможет тебе узнать больше о языках программирования и фреймворках.\n\nВыбери язык с помощью инлайн-кнопок снизу, чтобы узнать всю информацию о нём.');
});

function sendLanguages(chatId, text, messageId = null) {
    const buttons = [];
    const keys = Object.keys(languages);

    for (let i = 0; i < keys.length; i += 3) {
        buttons.push(keys.slice(i, i + 3).map(lang => ({ text: lang, callback_data: `lang_${lang}` })));
    }

    if (messageId) {
        bot.editMessageText(text, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: { inline_keyboard: buttons }
        });
    } else {
        bot.sendMessage(chatId, text, {
            reply_markup: { inline_keyboard: buttons }
        });
    }
}

function sendFrameworks(chatId, lang, messageId) {
    const fwList = frameworks[lang] || [];
    const buttons = [];
    for (let i = 0; i < fwList.length; i += 2) {
        buttons.push(fwList.slice(i, i + 2).map(fw => ({ text: fw, callback_data: `fw_${fw}` })));
    }
    buttons.push([{ text: 'Назад', callback_data: 'back_to_languages' }]);

    bot.editMessageText(languages[lang], {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: buttons }
    });
}

function sendFrameworkInfo(chatId, fw, messageId) {
    bot.editMessageText(frameworks[fw] || 'Информация отсутствует.', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
            inline_keyboard: [[{ text: 'Назад', callback_data: 'back_to_languages' }]]
        }
    });
}

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;
   
    if (data.startsWith('lang_')) {
        const lang = data.replace('lang_', '');
        sendFrameworks(chatId, lang, messageId);
    } else if (data.startsWith('fw_')) {
        const fw = data.replace('fw_', '');
        sendFrameworkInfo(chatId, fw, messageId);
    } else if (data === 'back_to_languages') {
        sendLanguages(chatId, 'Выбери язык программирования для получения информации о нём:', messageId);
    }
    bot.answerCallbackQuery(query.id);
});

console.log("Бот запущен!");