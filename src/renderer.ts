const { remote, ipcRenderer } = require('electron');

declare var Twitch: any;

const win = remote.getCurrentWindow();

const title_bar = document.getElementById("title-bar");
const window_channel_input = document.getElementById("window-channel-input") as HTMLInputElement;
const window_channel_button = document.getElementById("window-channel-button");
const window_channel_check = document.getElementById("window-channel-check");
const window_channel_input_select = document.getElementById("window-channel-input-select");
const window_game = document.getElementById("window-game");
const min_button = document.getElementById("min-button");
const max_button = document.getElementById("max-button");
const restore_button = document.getElementById("restore-button");
const close_button = document.getElementById("close-button");

const select_class = "channel_selection";

let twitchOptions;
let player;

document.onreadystatechange = () => {
    if (document.readyState === "complete") {

        win.on("maximize", (event) => document.body.classList.toggle("maximized"));
        win.on("unmaximize", (event) => document.body.classList.toggle("maximized"));

        min_button.addEventListener("click", (event) => win.minimize());
        max_button.addEventListener("click", (event) => win.maximize());
        restore_button.addEventListener("click", (event) => win.unmaximize());
        close_button.addEventListener("click", (event) => win.close());

        window_channel_input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                goChannel();
            }
        });
        window_channel_button.addEventListener('click', goChannel);
        window_channel_check.addEventListener('change', alwaysTop);

        ipcRenderer.on('toggle-title-bar', (event, data) => {
            title_bar.classList.toggle("hide");
        });

        buildDataListElements();

        twitchOptions = {
            channel: getStoragedChannel(),
            height: "100%",
            width: "100%",
        };

        getChannelInfos(twitchOptions.channel);

        player = new Twitch.Player("twitch-container", twitchOptions);
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

    if(!channel){
        return;
    }

    buildRequest('https://api.twitch.tv/kraken/users?login='+ channel).then((response_users: any) => {
        buildRequest('https://api.twitch.tv/kraken/streams/' + response_users.users[0]._id).then((response_streams: any) => {
            const game = response_streams.stream.game;
            const viewers = response_streams.stream.viewers;
            const html = game + " - " + viewers;
            window_game.innerText = html;
        }).catch((error) => {
            console.log('Something went wrong streams', error);
        });
    }).catch((error) => {
        console.log('Something went wrong on users', error);
    });
}

const goChannel = (event: Event = null) => {
    const oldChannel = twitchOptions.channel;
    const newChannel = window_channel_input.value;
    if (newChannel !== null && newChannel !== oldChannel) {
        getChannelInfos(newChannel);
        twitchOptions.channel = newChannel;
        setStoragedChannel(newChannel);
        player.setChannel(newChannel);
    }
}

const setStoragedChannel = (currentChannel: string) => {
    if (!currentChannel) {
        return;
    }

    const channels_string = localStorage.getItem("channels");
    if (channels_string) {
        const channels = JSON.parse(channels_string);

        if (!channels.find((x: string) => x === currentChannel)) {

            channels.push(currentChannel);
            localStorage.setItem("channels", JSON.stringify(channels));

            buildDataListElements();
        }
    }

    (document.getElementById("window-channel-input") as HTMLInputElement).value = currentChannel;
    localStorage.setItem("currentChannel", currentChannel);
};

const getStoragedChannel = () => {
    let currentChannel = localStorage.getItem("currentChannel");
    if (!currentChannel) {
        localStorage.setItem("currentChannel", "noway4u_sir");
        currentChannel = "noway4u_sir";
    }

    const channels_string = localStorage.getItem("channels");
    if (channels_string) {
        const channels = JSON.parse(channels_string);
        if (channels.length < 1) {
            localStorage.setItem("channels", JSON.stringify(["noway4u_sir"]));
        }
    }
    else {
        localStorage.setItem("channels", JSON.stringify(["noway4u_sir"]));
    }

    window_channel_input.value = currentChannel;
    return currentChannel;
};

const buildDataListElements = () => {
    const channels_string = localStorage.getItem("channels");

    if (channels_string) {
        const channels = JSON.parse(channels_string);
        if (channels.length > 0) {
            const els = document.getElementsByClassName(select_class);

            for (let index = 0; index < els.length; index++) {
                const element = els[index];
                window_channel_input_select.removeChild(element);
            }

            channels.forEach((item) => {
                const id = "channel_selection_" + item;
                const el = document.getElementById(id);
                if (!el) {
                    const option = document.createElement('option');
                    option.id = id;
                    option.classList.add(select_class);
                    option.value = item;
                    window_channel_input_select.appendChild(option);
                }
            });
        }
    }
};

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