const client = require("../../index");
const { ChannelType, GuildVoice, Collection } = require("discord.js");
const schema = require("../../Models/join-to-create");
const { voice } = require("../../index");
let voiceManager = new Collection()

module.exports = {
    name: "jointocreate",
}

client.on("voiceStateUpdate", async (oldState, newState) => {
    const { member, guild } = oldState;
    const newChannel = newState.channel;
    const oldChannel = oldState.channel;

    const data = await schema.findOne({ guildId: guild.id })
    if (!data) return;

    if (data) {
        const channels = data.channels;
    
        for (const channelData of channels) {
            const channelId = channelData.channelId;
            const userlimit = channelData.userLimit;
            const channel = client.channels.cache.get(channelId);
    
            if (!channel) continue;
    
            if (oldChannel !== newChannel && newChannel && newChannel.id === channel.id) {
                let existingVoiceChannelId = voiceManager.get(member.id);
                if (existingVoiceChannelId) {
                    let existingVoiceChannel = guild.channels.cache.get(existingVoiceChannelId);
                    if (existingVoiceChannel.members.size === 0) {
                        existingVoiceChannel.delete().catch((e) => null);
                        voiceManager.delete(member.id);
                    }
                }

                const voiceChannel = await guild.channels.create({
                    name: `${newChannel.name}`,
                    type: ChannelType.GuildVoice,
                    parent: newChannel.parent,
                    permissionOverwrites: [
                        {
                            id: member.id,
                            allow: ["Connect", "ManageChannels"],
                        },
                        {
                            id: guild.id,
                            allow: ["Connect"],
                        },
                    ],
                    userLimit: userlimit
                })

                voiceManager.set(member.id, voiceChannel.id);

                await newChannel.permissionOverwrites.edit(member, {
                    Connect: false
                });
                setTimeout(() => {
                    newChannel.permissionOverwrites.delete(member);
                }, 5000)

                return setTimeout(() => {
                    member.voice.setChannel(voiceChannel)
                }, 500)
            }

            const jointocreate = voiceManager.get(member.id);
            const members = oldChannel?.members
            .filter((m) => !m.user.bot)
            .map((m) => m.id)

            if (
                jointocreate &&
                oldChannel.id === jointocreate &&
                (!newChannel || newChannel.id !== jointocreate)
            ) {
                if (members.length > 0) {
                    let randomID = members[Math.floor(Math.random() * members.length)];
                    let randomMember = guild.members.cache.get(randomID);
                    randomMember.voice.setChannel(oldChannel).then((v) => {
                        oldChannel.setName(channelData.name).catch((e) => null);
                        oldChannel.permissionOverwrites.edit(randomMember, {
                            Connect: true,
                            ManageChannels: true
                        })
                    })
                    voiceManager.set(member.id, null)
                    voiceManager.set(randomMember.id, oldChannel.id)
                } else {
                    voiceManager.delete(member.id);
                    oldChannel.delete().catch((e) => null)
                }
            }
        }
    }
})