require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');
const punycode = require('punycode/');

// 設置 Discord 客戶端
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// 設置 OpenAI API 客戶端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


// 當機器人準備就緒時觸發
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const userConversations = {};

// 監聽訊息事件
client.on('messageCreate', async (message) => {


  const userId = message.author.id;

  // 初始化用户会话记录
  if (!userConversations[userId]) {
    userConversations[userId] = [];
  }


  userConversations[userId].push({role: 'system' , content: '你是使用者的女朋友 用女朋友的身分跟使用者說話'},{ role: 'user', content: message.content });

  // 限制上下文长度，避免负载过大
  if (userConversations[userId].length > 10) {
    userConversations[userId].shift(); // 删除最早的消息
  }


  // 忽略來自機器人的訊息
  if (message.author.bot) return;

  // 使用 ChatGPT 回應訊息
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages:userConversations[userId],
    });
    const reply = chatCompletion.choices[0].message.content;
    console.log(chatCompletion.choices[0].message.content);
    //const reply = chatCompletion.choices[0].message.content.trim();
    userConversations[userId].push({ role: 'assistant', content: reply });

    message.reply(reply);
  } catch (error) {
    console.error('Error with OpenAI API:', error);

    message.reply('Please try again in 20s.');
  }
});

// 登入 Discord
client.login(process.env.DISCORD_TOKEN);
