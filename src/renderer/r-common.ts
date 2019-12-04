import { remote } from 'electron';

declare global {
  const Twitch: any
}

export interface Channel {
  name: string,
  date: Date
}


export const win = remote.getCurrentWindow();

export namespace HtmlElements {
  export const title_bar = document.getElementById("title-bar");
  export const window_channel_input = document.getElementById("window-channel-input") as HTMLInputElement;
  export const window_channel_button = document.getElementById("window-channel-button");
  export const window_channel_check = document.getElementById("window-channel-check");
  export const window_channel_input_select = document.getElementById("window-channel-input-select");
  export const window_game = document.getElementById("window-game");
  export const min_button = document.getElementById("min-button");
  export const max_button = document.getElementById("max-button");
  export const restore_button = document.getElementById("restore-button");
  export const close_button = document.getElementById("close-button");
}

export const select_class = "channel_selection";
