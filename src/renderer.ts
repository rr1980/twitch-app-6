
import { ipcRenderer } from 'electron';
import { win, Channel, HtmlElements } from './common';


const select_class = "channel_selection";

let twitchOptions;
let player;
let channels: Channel[] = [];

document.onreadystatechange = () => {
    if (document.readyState === "complete") {

        win.on("maximize", (event) => document.body.classList.toggle("maximized"));
        win.on("unmaximize", (event) => document.body.classList.toggle("maximized"));

        HtmlElements.min_button.addEventListener("click", (event) => win.minimize());
        HtmlElements.max_button.addEventListener("click", (event) => win.maximize());
        HtmlElements.restore_button.addEventListener("click", (event) => win.unmaximize());
        HtmlElements.close_button.addEventListener("click", (event) => win.close());

        HtmlElements.window_channel_input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                goChannel();
            }
        });
        HtmlElements.window_channel_button.addEventListener('click', goChannel);
        HtmlElements.window_channel_check.addEventListener('change', alwaysTop);

        ipcRenderer.on('toggle-title-bar', (event, data) => {
            HtmlElements.title_bar.classList.toggle("hide");
        });

        ipcRenderer.on('toggle-dev', (event, data) => {
            win.webContents.openDevTools();
        });

        initChannels();

        buildDataListElements();

        const lastChnnel = getLastChannel();

        twitchOptions = {
            channel: lastChnnel ? lastChnnel.name : null,
            height: "100%",
            width: "100%",
        };

        HtmlElements.window_channel_input.value = twitchOptions.channel;
        player = new Twitch.Player("twitch-container", twitchOptions);

        getChannelInfos(twitchOptions.channel);
    }
};

const buildRequest = (url: string, method: string = null) => {
    const request = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
        request.onreadystatechange = () => {

            if (request.readyState !== 4) {
                return;
            }

            if (request.status >= 200 && request.status < 300) {
                resolve(JSON.parse(request.response));
            } else {
                reject({
                    status: request.status,
                    statusText: request.statusText
                });
            }
        };

        request.open(method || 'GET', url, true);
        request.setRequestHeader("Accept", "application/vnd.twitchtv.v5+json");
        request.setRequestHeader("Client-ID", "5cpe3bosnf6rh3rll3ic5i9lszmfca");
        request.send();

    });

}

const getChannelInfos = (channel: string) => {

    if (!channel) {
        return;
    }

    buildRequest('https://api.twitch.tv/kraken/users?login=' + channel).then((response_users: any) => {
        buildRequest('https://api.twitch.tv/kraken/streams/' + response_users.users[0]._id).then((response_streams: any) => {
            const game = response_streams.stream.game;
            const viewers = response_streams.stream.viewers;
            const html = game + " - " + viewers;
            HtmlElements.window_game.innerText = html;
        }).catch((error) => {
            console.log('Something went wrong streams', error);
        });
    }).catch((error) => {
        console.log('Something went wrong on users', error);
    });
}

const goChannel = (event: Event = null) => {
    const oldChannel = getLastChannel();
    const newChannel = HtmlElements.window_channel_input.value;
    if (newChannel && (!oldChannel || newChannel !== oldChannel.name)) {
        HtmlElements.window_channel_input.value = newChannel;
        setStoragedChannel(newChannel);
        player.setChannel(newChannel);
        getChannelInfos(newChannel);
    }
}

const initChannels = () => {
    const _channels_string = localStorage.getItem("channels");

    if (_channels_string) {
        const _channels = JSON.parse(_channels_string) as Channel[];
        channels = _channels.sort((a, b) => 0 - (a.date > b.date ? 1 : -1));
    }
}

const setStoragedChannel = (currentChannel: string) => {

    const exist = channels.find(x => x.name === currentChannel);

    if (exist) {
        exist.date = new Date();
    }
    else {
        channels.push({
            name: currentChannel,
            date: new Date()
        });
    }

    const _channels = channels.sort((a, b) => 0 - (a.date > b.date ? 1 : -1));
    localStorage.setItem("channels", JSON.stringify(_channels));
    initChannels();
    buildDataListElements();
}

const getLastChannel = () => {
    if (channels && channels.length) {
        channels = channels.sort((a, b) => 0 - (a.date > b.date ? 1 : -1));
        return channels[0];
    }
}

const buildDataListElements = () => {

    HtmlElements.window_channel_input_select.innerHTML = "";

    if (channels.length > 0) {
        channels.forEach((item) => {
            const id = "channel_selection_" + item.name;
            const option = document.createElement('option');
            option.id = id;
            option.classList.add(select_class);
            option.value = item.name;
            HtmlElements.window_channel_input_select.appendChild(option);
        });
    }
}

const toggleMaxRestoreButtons = () => {
    if (win.isMaximized()) {
        document.body.classList.add("maximized");
    } else {
        document.body.classList.remove("maximized");
    }
};

const alwaysTop = (event: any) => {
    win.setAlwaysOnTop(event.target.checked);
}