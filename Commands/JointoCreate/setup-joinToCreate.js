const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const schema = require("../../Models/join-to-create");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-jointocreate")
    .setDescription("Set up the join-to-create system.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Select the channel for the Join-to-Create system.")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice)
    )
    .addNumberOption((option) =>
      option
        .setName("userlimit")
        .setDescription("The user limit of every Join-to-Create channel. (1-99)")
        .setMinValue(1)
        .setMaxValue(99)
        .setRequired(false)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const userLimit = interaction.options.getNumber("userlimit");
    const data = await schema.findOne({ guildId: interaction.guild.id });

    if (!data) {
      const newData = new schema({
        guildId: interaction.guild.id,
        channels: [{ channelId: channel.id, userLimit }],
      });

      await newData.save();
      interaction.reply({
        content: "The Join-to-Create system has been set up successfully.",
        ephemeral: true,
      });
    } else if (data.channels.some((c) => c.channelId === channel.id)) {
      interaction.reply({
        content: "This voice channel is already set up as a Join-to-Create system.",
        ephemeral: true,
      });
    } else {
      data.channels.push({ channelId: channel.id, userLimit });
      await data.save();
      interaction.reply({
        content: "The Join-to-Create system has been set up successfully.",
        ephemeral: true,
      });
    }
  },
};
