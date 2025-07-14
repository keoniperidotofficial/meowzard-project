require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const normalCats = [
  "Tabby", "Calico", "Siamese", "Maine Coon", "Persian", "Bengal", "Russian Blue",
  "Scottish Fold", "Sphynx", "Ragdoll", "British Shorthair", "Norwegian Forest",
  "Abyssinian", "Savannah", "Turkish Van", "Manx", "Oriental", "Himalayan",
  "Tonkinese", "Bombay", "Balinese", "Birman"
];
const specialCat = "✨ Divine Meow (Legendary) ✨";

function getRandomCat() {
  return Math.random() < 0.05
    ? specialCat
    : normalCats[Math.floor(Math.random() * normalCats.length)];
}

const inventories = {};

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Ping the bot'),
  new SlashCommandBuilder().setName('shutdown').setDescription('Shut down the bot'),
  new SlashCommandBuilder().setName('givemeow').setDescription('Get a random cat'),
  new SlashCommandBuilder().setName('forcespawn').setDescription('Force-spawn a meow into the chat'),
  new SlashCommandBuilder().setName('inventory').setDescription('Show your cat collection')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
const CLIENT_ID = process.env.CLIENT_ID;

(async () => {
  try {
    console.log('Refreshing global slash commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('Global slash commands registered.');
  } catch (err) {
    console.error(err);
  }
})();

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const userId = interaction.user.id;
  const cmd = interaction.commandName;

  if (cmd === 'ping') {
    await interaction.reply('🏓 Pong from the dashboard bot!');
  } else if (cmd === 'shutdown') {
    await interaction.reply('💤 Shutting down. Goodbye!');
    client.destroy();
  } else if (cmd === 'givemeow') {
    const cat = getRandomCat();
    if (!inventories[userId]) inventories[userId] = {};
    inventories[userId][cat] = (inventories[userId][cat] || 0) + 1;
    await interaction.reply(`You got a 🐱: **${cat}**! Added to your collection.`);
  } else if (cmd === 'forcespawn') {
    const cat = getRandomCat();
    await interaction.reply(`🚨 A wild **${cat}** has appeared! Adopt it now! 🐾`);
  } else if (cmd === 'inventory') {
    if (!inventories[userId]) {
      await interaction.reply("You don't have any cats yet! Use /givemeow to get some.");
      return;
    }
    const userCats = inventories[userId];
    const inventoryList = Object.entries(userCats)
      .map(([cat, count]) => `**${cat}** x${count}`)
      .join('\n');
    await interaction.reply(`🐾 Your Cat Collection:\n${inventoryList}`);
  }
});

client.login(process.env.DISCORD_TOKEN);
// Keep Render happy by starting a simple HTTP server
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Meowzard bot is awake!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
client.login(process.env.DISCORD_TOKEN);
});

