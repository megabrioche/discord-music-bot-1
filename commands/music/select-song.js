const { Command } = require('discord.js-commando');
const Youtube = require('../../helpers/integrations/youtube');

/**
 * Command responsible for filtering out the songs saved in memory from one location to the other.
 * Usually searched records sre saved in stash (searches map) in music player object. This map gets filtered out in this command
 * and saved to the queue (_queue MAP) which can be played by music player by initiating play command.
 *
 * @type {module.SelectSongCommand}
 */
module.exports = class SelectSongCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'select',
            aliases: ['select-song', 'pick', 'take', 'choose'],
            group: 'music',
            memberName: 'select',
            description: 'Selects which song(s) should be added to player',
            examples: ['select 1', 'select 1,2', 'select all'],
            guildOnly: true,
            args: [{
                key: 'selection',
                prompt: 'Enter song numbers you would like to add to queue',
                type: 'string'
            }],
        });
        this.youtube = new Youtube(client.config.youtube.token, client.config.youtube.base_url);
    }

    async run(msg, args) {
        try {
            (await msg.say('Adding track(s) to music queue. Please be patient.')).delete(12000);

            let searches = this.client.music.searches.get(msg.guild.id);
            if (!searches) return (await msg.say('Please search for songs first. Search stash is empty!')).delete(12000);
            let addedToQueue = 0;

            if (args.selection.toLowerCase() === 'all') {
                this.client.music.loadTracks(searches, msg.guild);
                addedToQueue = searches.length;
            } else {
                let selection = args.selection.match(/\d+/g);
                for (let index = 0; index < searches.length; index++)
                    for (let selectedIndex of selection)
                        if (parseInt(selectedIndex) === index+1) {
                            addedToQueue++;
                            this.client.music.loadTrack(searches[index], msg.guild);
                        }
            }

            return (await msg.say(`${addedToQueue} song(s) have been added to queue`)).delete(12000);

        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }

};