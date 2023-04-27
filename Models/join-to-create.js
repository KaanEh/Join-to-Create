const { model, Schema } = require("mongoose");

const schema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  channels: {
    type: [
      {
        channelId: {
          type: String,
          required: true,
        },
        userLimit: {
          type: Number,
          default: null,
          min: 1,
          max: 99,
        },
      },
    ],
    default: [],
  },
});

module.exports = model("join-to-create", schema);
