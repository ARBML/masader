(function () {
    'use strict';
    const thread = document.getElementById('chat-thread');
    const input = document.getElementById('chat-input');
    const send = document.getElementById('chat-send');
    const clear = document.getElementById('chat-clear');
    const logPanel = document.getElementById('chat-log');
    if (!thread || !input || !send || !window.MasaderChat) return;

    new window.MasaderChat({
        thread: thread,
        input: input,
        send: send,
        clear: clear,
        logPanel: logPanel,
    });
})();
