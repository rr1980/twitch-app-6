import { ChannelManager } from "./r-channel-manager";
import { ipcRenderer } from 'electron';
import { win, HtmlElements, Channel, select_class } from './r-common';

export class App {

    private _channelManager: ChannelManager;
    private _player: any;

    constructor() {
        this.initElements();
        this._channelManager = new ChannelManager();

        this._channelManager.channels.subscribe((c: Channel[]) => {
            this.buildDataListElements(c);
        });

        this._channelManager.currentChannel.subscribe((c: Channel) => {
            if (c) {
                HtmlElements.window_channel_input.value = c.name;
                this.getChannelInfos(c.name);

                if (this._player) {
                    this._player.setChannel(c.name);
                }
                else {
                    this._player = new Twitch.Player("twitch-container", {
                        channel: c.name,
                        height: "100%",
                        width: "100%",
                    });
                }
            }
        });
    }  

    private goChannel() {
        const newChannel = HtmlElements.window_channel_input.value;
        if (newChannel && newChannel.length > 0) {
            this._channelManager.goChannel(newChannel);
        }
    };

    private buildRequest(url: string, method: string = null) {
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

    private getChannelInfos(channel: string) {

        if (!channel) {
            return;
        }

        this.buildRequest('https://api.twitch.tv/kraken/users?login=' + channel).then((response_users: any) => {
            this.buildRequest('https://api.twitch.tv/kraken/streams/' + response_users.users[0]._id).then((response_streams: any) => {
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

    private alwaysTop(event: any) {
        win.setAlwaysOnTop(event.target.checked);
    }

    private buildDataListElements(channels: Channel[]) {
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

    private initElements() {
        win.on("maximize", (event) => document.body.classList.toggle("maximized"));
        win.on("unmaximize", (event) => document.body.classList.toggle("maximized"));
        HtmlElements.min_button.addEventListener("click", (event) => win.minimize());
        HtmlElements.max_button.addEventListener("click", (event) => win.maximize());
        HtmlElements.restore_button.addEventListener("click", (event) => win.unmaximize());
        HtmlElements.close_button.addEventListener("click", (event) => win.close());
        HtmlElements.window_channel_check.addEventListener('change', this.alwaysTop);

        HtmlElements.window_channel_input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.goChannel();
            }
        });
        HtmlElements.window_channel_button.addEventListener('click', this.goChannel.bind(this));

        ipcRenderer.on('toggle-title-bar', (event, data) => {
            HtmlElements.title_bar.classList.toggle("hide");
        });

        ipcRenderer.on('toggle-dev', (event, data) => {
            win.webContents.openDevTools();
        });
    }

} 