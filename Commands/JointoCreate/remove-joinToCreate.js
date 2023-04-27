const { SlashCommandBuilder, ChannelType } = require("discord.js");
const schema = require("../../Models/join-to-create");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-jointocreate")
    .setDescription("Remove a voice channel from the Join-to-Create system.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Select the voice channel to remove from the Join-to-Create system.")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const data = await schema.findOne({ guildId: interaction.guild.id });

    if (!data) {
      interaction.reply({
        content: "The Join-to-Create system has not been set up for this server.",
        ephemeral: true,
      });
    } else if (!data.channels.some((c) => c.channelId === channel.id)) {
      interaction.reply({
        content: "This voice channel is not set up as a Join-to-Create system.",
        ephemeral: true,
      });
    } else {
      data.channels = data.channels.filter((c) => c.channelId !== channel.id);
      await data.save();
      interaction.reply({
        content: "The voice channel has been removed from the Join-to-Create system.",
        ephemeral: true,
      });
    }
  },
};
