
import { ipcRenderer } from 'electron';
import { win, HtmlElements, Channel, select_class } from './r-common';
import { ChannelManager } from './r-channel-manager';

let channelManager: ChannelManager;
let player;

document.onreadystatechange = () => {
    if (document.readyState === "complete") {
        initElements();
        channelManager = new ChannelManager();

        channelManager.channels.subscribe((c: Channel[]) => {
            buildDataListElements(c);
        });

        channelManager.currentChannel.subscribe((c: Channel) => {
            if (c) {
                HtmlElements.window_channel_input.value = c.name;
                getChannelInfos(c.name);

                if (player) {
                    player.setChannel(c.name);
                }
                else {
                    player = new Twitch.Player("twitch-container", {
                        channel: c.name,
                        height: "100%",
                        width: "100%",
                    });
                }
            }
        });
    }
};

const initElements = () => {
    win.on("maximize", (event) => document.body.classList.toggle("maximized"));
    win.on("unmaximize", (event) => document.body.classList.toggle("maximized"));
    HtmlElements.min_button.addEventListener("click", (event) => win.minimize());
    HtmlElements.max_button.addEventListener("click", (event) => win.maximize());
    HtmlElements.restore_button.addEventListener("click", (event) => win.unmaximize());
    HtmlElements.close_button.addEventListener("click", (event) => win.close());
    HtmlElements.window_channel_check.addEventListener('change', alwaysTop);

    HtmlElements.window_channel_input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            goChannel();
        }
    });
    HtmlElements.window_channel_button.addEventListener('click', goChannel);

    ipcRenderer.on('toggle-title-bar', (event, data) => {
        HtmlElements.title_bar.classList.toggle("hide");
    });

    ipcRenderer.on('toggle-dev', (event, data) => {
        win.webContents.openDevTools();
    });
}


const buildDataListElements = (channels: Channel[]) => {
    HtmlElements.window_channel_input_select.innerHTML = "";
    if (channels.length > 0) {
        const _channels = channels.sort((a, b) => 0 - (a.date > b.date ? 1 : -1));
        _channels.forEach((item) => {
            const id = "channel_selection_" + item.name;
            const option = document.createElement('option');
            option.id = id;
            option.classList.add(select_class);
            option.value = item.name;
            HtmlElements.window_channel_input_select.appendChild(option);
        });
    }
}

const goChannel = () => {
    const newChannel = HtmlElements.window_channel_input.value;
    if (newChannel && newChannel.length > 0) {
        channelManager.goChannel(newChannel);
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

const alwaysTop = (event: any) => {
    win.setAlwaysOnTop(event.target.checked);
}