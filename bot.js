require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const http = require('http');

console.log('Starting Meowzard Bot...');
console.log('DISCORD_TOKEN loaded:', !!process.env.DISCORD_TOKEN);

// Check for missing env vars
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
  console.error("❌ Missing environment variables. Please check .env or Render config.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Meow pool
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

// Simple in-memory inventory
const inventories = {};

// Slash commands
const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Ping the bot'),
  new SlashCommandBuilder().setName('shutdown').setDescription('Shut down the bot'),
  new SlashCommandBuilder().setName('givemeow').setDescription('Get a random cat'),
  new SlashCommandBuilder().setName('forcespawn').setDescription('Force-spawn a meow into the chat'),
  new SlashCommandBuilder().setName('inventory').setDescription('Show your cat collection'),
].map(cmd => cmd.toJSON());

// Register commands
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('📦 Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered.');
  } catch (err) {
    console.error('❌ Failed to register commands:', err);
  }
})();

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const userId = interaction.user.id;
  const cmd = interaction.commandName;

  if (cmd === 'ping') {
    await interaction.reply('🏓 Pong from Meowzard!');
  } else if (cmd === 'shutdown') {
    await interaction.reply('💤 Shutting down... Goodbye!');
    client.destroy();
  } else if (cmd === 'givemeow') {
    const cat = getRandomCat();
    if (!inventories[userId]) inventories[userId] = {};
    inventories[userId][cat] = (inventories[userId][cat] || 0) + 1;
    await interaction.reply(`🐱 You got: **${cat}**!`);
  } else if (cmd === 'forcespawn') {
    const cat = getRandomCat();
    await interaction.reply(`🚨 A wild **${cat}** has appeared! Adopt it now! 🐾`);
  } else if (cmd === 'inventory') {
    if (!inventories[userId]) {
      await interaction.reply("😿 You don't have any cats yet! Use /givemeow to start!");
      return;
    }
    const inventoryList = Object.entries(inventories[userId])
      .map(([cat, count]) => `**${cat}** x${count}`)
      .join('\n');
    await interaction.reply(`🐾 Your Cat Collection:\n${inventoryList}`);
  }
});

// Attempt to login
client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('❌ Failed to login:', err);
});

// Render port server to keep bot alive
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('🐱 Meowzard bot is awake and purring!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 HTTP server listening on port ${PORT}`);
});