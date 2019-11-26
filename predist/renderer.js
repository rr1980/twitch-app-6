var _a = require('electron'), remote = _a.remote, ipcRenderer = _a.ipcRenderer;
var win = remote.getCurrentWindow();
var title_bar = document.getElementById("title-bar");
var window_channel_input = document.getElementById("window-channel-input");
var window_channel_button = document.getElementById("window-channel-button");
var window_channel_check = document.getElementById("window-channel-check");
var window_channel_input_select = document.getElementById("window-channel-input-select");
var min_button = document.getElementById("min-button");
var max_button = document.getElementById("max-button");
var restore_button = document.getElementById("restore-button");
var close_button = document.getElementById("close-button");
// const twitch_container = document.getElementById("twitch-container");
var select_class = "channel_selection";
var twitchOptions;
var player;
document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        win.on("maximize", function (event) { return document.body.classList.toggle("maximized"); });
        win.on("unmaximize", function (event) { return document.body.classList.toggle("maximized"); });
        min_button.addEventListener("click", function (event) { return win.minimize(); });
        max_button.addEventListener("click", function (event) { return win.maximize(); });
        restore_button.addEventListener("click", function (event) { return win.unmaximize(); });
        close_button.addEventListener("click", function (event) { return win.close(); });
        window_channel_input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                goChannel();
            }
        });
        window_channel_button.addEventListener('click', goChannel);
        window_channel_check.addEventListener('change', alwaysTop);
        ipcRenderer.on('toggle-title-bar', function (event, data) {
            title_bar.classList.toggle("hide");
            // twitch_container.classList.toggle("max");
        });
        buildDataListElements();
        twitchOptions = {
            channel: getStoragedChannel(),
            height: "100%",
            width: "100%"
        };
        player = new Twitch.Player("twitch-container", twitchOptions);
    }
};
var goChannel = function (event) {
    if (event === void 0) { event = null; }
    var oldChannel = twitchOptions.channel;
    var newChannel = window_channel_input.value;
    if (newChannel !== null && newChannel !== oldChannel) {
        twitchOptions.channel = newChannel;
        setStoragedChannel(newChannel);
        player.setChannel(newChannel);
    }
};
var setStoragedChannel = function (currentChannel) {
    if (!currentChannel) {
        return;
    }
    var channels_string = localStorage.getItem("channels");
    if (channels_string) {
        var channels = JSON.parse(channels_string);
        if (!channels.find(function (x) { return x === currentChannel; })) {
            channels.push(currentChannel);
            localStorage.setItem("channels", JSON.stringify(channels));
            buildDataListElements();
        }
    }
    document.getElementById("window-channel-input").value = currentChannel;
    localStorage.setItem("currentChannel", currentChannel);
};
var getStoragedChannel = function () {
    var currentChannel = localStorage.getItem("currentChannel");
    if (!currentChannel) {
        localStorage.setItem("currentChannel", "noway4u_sir");
        currentChannel = "noway4u_sir";
    }
    var channels_string = localStorage.getItem("channels");
    if (channels_string) {
        var channels = JSON.parse(channels_string);
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
var buildDataListElements = function () {
    var channels_string = localStorage.getItem("channels");
    if (channels_string) {
        var channels = JSON.parse(channels_string);
        if (channels.length > 0) {
            var els = document.getElementsByClassName(select_class);
            for (var index = 0; index < els.length; index++) {
                var element = els[index];
                window_channel_input_select.removeChild(element);
            }
            channels.forEach(function (item) {
                var id = "channel_selection_" + item;
                var el = document.getElementById(id);
                if (!el) {
                    var option = document.createElement('option');
                    option.id = id;
                    option.classList.add(select_class);
                    option.value = item;
                    window_channel_input_select.appendChild(option);
                }
            });
        }
    }
};
var toggleMaxRestoreButtons = function () {
    if (win.isMaximized()) {
        document.body.classList.add("maximized");
    }
    else {
        document.body.classList.remove("maximized");
    }
};
var alwaysTop = function (event) {
    win.setAlwaysOnTop(event.target.checked);
};
//# sourceMappingURL=renderer.js.map