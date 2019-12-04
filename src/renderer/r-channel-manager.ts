import { Channel, HtmlElements } from './r-common';
import { BehaviorSubject, Observable } from 'rxjs';

export class ChannelManager {

    private _channels: Channel[] = [];
    private _observableChannels: BehaviorSubject<Channel[]> = new BehaviorSubject([]);

    private _currentChannel: Channel;
    private _observableCurrentChannel: BehaviorSubject<Channel> = new BehaviorSubject(null);

    get channels(): Observable<Channel[]> {
        return this._observableChannels.asObservable();
    }

    get currentChannel(): Observable<Channel> {
        return this._observableCurrentChannel.asObservable();
    }

    constructor() {
        this.initChannels();
    }

    public goChannel(newChannel: string) {
        this._currentChannel = {
            name: newChannel,
            date: new Date()
        } as Channel;
        this._observableCurrentChannel.next(this._currentChannel);
        localStorage.setItem("lastChannel", JSON.stringify(this._currentChannel, this.jsonDateReplacer));

        const exist = this._channels.find(x => x.name === this._currentChannel.name);
        if (exist) {
            exist.date = new Date();
        }
        else {
            this._channels.push(this._currentChannel);
        }

        this._observableChannels.next( this._channels);
        localStorage.setItem("channels", JSON.stringify(this._channels, this.jsonDateReplacer));
    }

    private jsonDateReviver(key, value) {
        if (key === 'date') {
            return new Date(value);
        }
        return value;
    }

    private jsonDateReplacer(key, value) {

        if (this[key] instanceof Date) {
            return this[key].toJSON();
        }

        return value;
    }

    private initChannels() {
        const _channels_string = localStorage.getItem("channels");

        if (_channels_string) {
            this._channels = JSON.parse(_channels_string, this.jsonDateReviver) as Channel[];
            this._observableChannels.next(this._channels);
        }

        const _lastChannel_string = localStorage.getItem("lastChannel");

        if (_lastChannel_string) {
            this._currentChannel = JSON.parse(_lastChannel_string, this.jsonDateReviver) as Channel;
            this._observableCurrentChannel.next(this._currentChannel);
        }
    }
}
