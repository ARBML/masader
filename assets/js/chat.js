/**
 * Masader datasets chatbot.
 *
 * A small, dependency-free chat controller that powers both the dedicated
 * /chat page and the floating widget. It talks to the `/chat` endpoint exposed
 * by the masader-webservice, which performs retrieval over the dataset
 * catalogue and answers via an LLM (OpenRouter).
 *
 * The endpoint may respond either as a Server-Sent-Events stream
 * (`text/event-stream`) for token-by-token output, or as a single JSON object
 * `{ answer, datasets }`. Both are handled transparently.
 */
(function () {
    'use strict';

    const CHAT_URL =
        (window.MasaderConfig && window.MasaderConfig.CHAT_URL) || '/chat';

    const SUGGESTIONS = [
        'Find datasets for Egyptian dialect sentiment analysis',
        'How many datasets are free and how many datasets are paid?',
        'Show me named entity recognition datasets after 2020',
        'Tell me about the Shami dataset',
        'How many datasets are over 1 billion tokens?',
        'Show me datasets for calligraphy',
    ];

    /* --------------------------------------------------------------------- */
    /* Helpers                                                               */
    /* --------------------------------------------------------------------- */

    function newSessionId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'sess-' + Math.random().toString(36).slice(2, 12);
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Very small, safe markdown-ish renderer: escapes HTML first, then applies a
     * limited set of formatting rules (bold, inline code, links, bullets).
     */
    // Safety net: hide the sources marker (and anything after it) in case the
    // backend ever streams it through (e.g. an unusual model formatting).
    const SOURCES_MARKER_RE = /\s*[*_#>-]*\s*%{2,}\s*SOURCES\s*%*[\s\S]*$/i;
    // Trailing incomplete marker, e.g. a truncated '%%%SOUR'.
    const SOURCES_PARTIAL_RE =
        /\s*[*_#>-]*\s*%{2,}\s*(?:S(?:O(?:U(?:R(?:C(?:E(?:S)?)?)?)?)?)?)?\s*$/i;
    const THINK_BLOCK_RE = /<think>[\s\S]*?<\/think>/gi;
    const THINK_OPEN_RE = /<think>[\s\S]*$/i;

    function stripSourcesMarker(text) {
        return text
            .replace(SOURCES_MARKER_RE, '')
            .replace(SOURCES_PARTIAL_RE, '');
    }

    function stripReasoning(text) {
        return text.replace(THINK_BLOCK_RE, '').replace(THINK_OPEN_RE, '');
    }

    const isTableRow = (line) => /^\s*\|(.+)\|\s*$/.test(line);
    const isTableSep = (line) =>
        /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.indexOf('-') !== -1;

    function splitTableRow(line) {
        return line
            .trim()
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((cell) => cell.trim());
    }

    function buildTable(header, rows) {
        let html = '<table class="masader-table"><thead><tr>';
        header.forEach((cell) => (html += '<th>' + cell + '</th>'));
        html += '</tr></thead><tbody>';
        rows.forEach((row) => {
            html += '<tr>';
            for (let i = 0; i < header.length; i++) {
                html += '<td>' + (row[i] || '') + '</td>';
            }
            html += '</tr>';
        });
        return html + '</tbody></table>';
    }

    function renderMarkdown(text) {
        let html = escapeHtml(stripSourcesMarker(stripReasoning(text)));

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        // Bold
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        // Markdown links [text](url)
        html = html.replace(
            /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener">$1</a>'
        );
        // Bare URLs (skip ones already inside an href attribute)
        html = html.replace(
            /(^|[^"'>=])(https?:\/\/[^\s<]+)/g,
            '$1<a href="$2" target="_blank" rel="noopener">$2</a>'
        );

        // Block-level parsing: tables, bullet lists, paragraphs.
        const lines = html.split(/\n/);
        let out = '';
        let inList = false;
        let i = 0;

        const closeList = () => {
            if (inList) {
                out += '</ul>';
                inList = false;
            }
        };

        while (i < lines.length) {
            const line = lines[i];

            // Table: a header row followed by a separator row (blank lines allowed
            // between rows, since the model sometimes inserts them).
            if (isTableRow(line)) {
                let j = i + 1;
                while (j < lines.length && lines[j].trim() === '') j++;

                if (j < lines.length && isTableSep(lines[j])) {
                    closeList();
                    const header = splitTableRow(line);
                    const rows = [];
                    let k = j + 1;
                    while (k < lines.length) {
                        if (lines[k].trim() === '') {
                            k++;
                            continue;
                        }
                        if (!isTableRow(lines[k])) break;
                        rows.push(splitTableRow(lines[k]));
                        k++;
                    }
                    out += buildTable(header, rows);
                    i = k;
                    continue;
                }
            }

            // Bullet lists
            if (/^\s*[-*]\s+/.test(line)) {
                if (!inList) {
                    out += '<ul>';
                    inList = true;
                }
                out += '<li>' + line.replace(/^\s*[-*]\s+/, '') + '</li>';
                i++;
                continue;
            }

            closeList();
            if (line.trim().length) out += '<p>' + line + '</p>';
            i++;
        }

        closeList();
        return out;
    }

    function cardUrl(id) {
        return 'card?id=' + encodeURIComponent(id);
    }

    /* --------------------------------------------------------------------- */
    /* Chat controller                                                       */
    /* --------------------------------------------------------------------- */

    class MasaderChat {
        /**
         * @param {object} opts
         * @param {HTMLElement} opts.thread   container where messages are rendered
         * @param {HTMLTextAreaElement} opts.input  the textarea
         * @param {HTMLButtonElement} opts.send  the send button
         * @param {HTMLButtonElement} [opts.clear]  optional clear-history button
         * @param {boolean} [opts.withSuggestions]  show starter suggestion chips
         */
        constructor(opts) {
            this.thread = opts.thread;
            this.input = opts.input;
            this.sendBtn = opts.send;
            this.clearBtn = opts.clear || null;
            // Temporary debug panel that shows backend pipeline logs in real time.
            this.logPanel = opts.logPanel || null;
            this.withSuggestions = opts.withSuggestions !== false;
            this.history = [];
            this.sessionId = newSessionId();
            this.sessionUsage = {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0,
            };
            this.busy = false;

            this.initLogPanel();

            this.sendBtn.addEventListener('click', () => this.submit());
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.submit();
                }
            });
            this.input.addEventListener('input', () => this.autoGrow());

            if (this.clearBtn) {
                this.clearBtn.addEventListener('click', () => this.clear());
            }

            if (this.withSuggestions) this.renderSuggestions();
        }

        /**
         * Reset the conversation: drop history and clear the rendered thread.
         */
        clear() {
            if (this.busy) return;
            this.history = [];
            this.sessionId = newSessionId();
            this.sessionUsage = {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0,
            };
            this.thread.innerHTML = '';
            this.clearLogs();
            this.updateUsageSummary(this.sessionUsage);
            this.input.value = '';
            this.autoGrow();
            if (this.withSuggestions) this.renderSuggestions();
            this.input.focus();
        }

        autoGrow() {
            this.input.style.height = 'auto';
            this.input.style.height =
                Math.min(this.input.scrollHeight, 140) + 'px';
        }

        renderSuggestions() {
            const wrap = document.createElement('div');
            wrap.className = 'masader-msg masader-msg--bot';
            const inner = document.createElement('div');
            inner.style.maxWidth = '100%';
            inner.innerHTML =
                '<div class="masader-msg__bubble">' +
                '👋 Ask me anything about the Arabic NLP datasets in the catalogue.' +
                '</div>';
            const chips = document.createElement('div');
            chips.className = 'masader-suggestions';
            chips.style.marginTop = '0.75rem';
            SUGGESTIONS.forEach((s) => {
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'masader-suggestion';
                chip.textContent = s;
                chip.addEventListener('click', () => {
                    this.input.value = s;
                    this.submit();
                });
                chips.appendChild(chip);
            });
            inner.appendChild(chips);
            wrap.appendChild(inner);
            this.thread.appendChild(wrap);
        }

        scrollToBottom() {
            this.thread.scrollTop = this.thread.scrollHeight;
        }

        /* ----- Temporary debug log panel ----- */
        initLogPanel() {
            if (!this.logPanel) return;

            const details = this.logPanel.closest('details.masader-log-panel');
            if (details) {
                this.usageEl = details.querySelector(
                    '.masader-log-panel__usage'
                );
                if (!this.usageEl) {
                    const summary = details.querySelector('summary');
                    this.usageEl = document.createElement('span');
                    this.usageEl.className = 'masader-log-panel__usage';
                    if (summary) summary.appendChild(this.usageEl);
                }
            }

            if (!this.logPanel.dataset.masaderLogInit) {
                this.logPanel.dataset.masaderLogInit = '1';
                this.logPanel.innerHTML = '';
                this.logLines = document.createElement('div');
                this.logLines.className = 'masader-log__lines';
                this.logPanel.appendChild(this.logLines);
            }

            this.updateUsageSummary(this.sessionUsage);
        }

        formatTokenCount(value) {
            return Number(value || 0).toLocaleString();
        }

        updateUsageSummary(usage) {
            if (!this.usageEl) return;
            const input = usage.prompt_tokens || 0;
            const output = usage.completion_tokens || 0;
            const total = usage.total_tokens || input + output;
            this.sessionUsage = {
                prompt_tokens: input,
                completion_tokens: output,
                total_tokens: total,
            };
            this.usageEl.textContent =
                'In: ' +
                this.formatTokenCount(input) +
                ' · Out: ' +
                this.formatTokenCount(output) +
                ' · ' +
                this.formatTokenCount(total);
        }

        clearLogs() {
            if (this.logLines) {
                this.logLines.innerHTML = '';
                return;
            }
            if (this.logPanel) this.logPanel.innerHTML = '';
        }

        logLine(entry) {
            if (!this.logLines) return;
            const line = document.createElement('div');
            const level = (entry.level || 'INFO').toUpperCase();
            line.className =
                'masader-log__line masader-log__line--' + level.toLowerCase();
            const time = new Date().toLocaleTimeString();
            line.innerHTML =
                '<span class="masader-log__time">' +
                escapeHtml(time) +
                '</span>' +
                '<span class="masader-log__level">' +
                escapeHtml(level) +
                '</span>' +
                '<span class="masader-log__msg">' +
                escapeHtml(entry.message || '') +
                '</span>';
            this.logLines.appendChild(line);
            this.logPanel.scrollTop = this.logPanel.scrollHeight;
        }

        appendMessage(role) {
            const msg = document.createElement('div');
            msg.className =
                'masader-msg ' +
                (role === 'user' ? 'masader-msg--user' : 'masader-msg--bot');
            const bubble = document.createElement('div');
            bubble.className = 'masader-msg__bubble';
            msg.appendChild(bubble);
            this.thread.appendChild(msg);
            this.scrollToBottom();
            return bubble;
        }

        showTyping() {
            const bubble = this.appendMessage('bot');
            bubble.innerHTML =
                '<span class="masader-typing"><span></span><span></span><span></span></span>';
            return bubble;
        }

        renderDatasetCards(container, datasets) {
            if (!datasets || !datasets.length) return;
            const wrap = document.createElement('div');
            wrap.className = 'masader-datasets';
            datasets.forEach((d) => {
                const card = document.createElement('a');
                card.className = 'masader-dataset-card';
                card.href = d.id ? cardUrl(d.id) : d.link || '#';
                card.target = '_blank';
                card.rel = 'noopener';

                const meta = [];
                if (d.year) meta.push(d.year);
                if (d.dialect) meta.push(d.dialect);
                if (d.tasks && d.tasks.length)
                    meta.push([].concat(d.tasks).slice(0, 3).join(', '));

                card.innerHTML =
                    '<div class="masader-dataset-card__name">' +
                    escapeHtml(d.name || d.id || 'dataset') +
                    '</div>' +
                    (meta.length
                        ? '<div class="masader-dataset-card__meta">' +
                          escapeHtml(meta.join(' • ')) +
                          '</div>'
                        : '') +
                    (d.description
                        ? '<div class="masader-dataset-card__desc">' +
                          escapeHtml(d.description) +
                          '</div>'
                        : '');
                wrap.appendChild(card);
            });
            container.appendChild(wrap);
        }

        setBusy(busy) {
            this.busy = busy;
            this.sendBtn.disabled = busy;
        }

        async submit() {
            const text = this.input.value.trim();
            if (!text || this.busy) return;

            // Clear suggestion intro on first real message
            this.input.value = '';
            this.autoGrow();

            this.appendMessage('user').textContent = text;
            this.history.push({ role: 'user', content: text });

            // Start a fresh log trace for this turn.
            this.clearLogs();

            this.setBusy(true);
            const typing = this.showTyping();

            try {
                await this.streamResponse(typing);
            } catch (err) {
                typing.innerHTML =
                    '<span class="masader-error">Something went wrong: ' +
                    escapeHtml(err.message || 'request failed') +
                    '</span>';
            } finally {
                this.setBusy(false);
                this.scrollToBottom();
            }
        }

        async streamResponse(bubble) {
            const response = await fetch(CHAT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: this.history,
                    session_id: this.sessionId,
                }),
            });

            if (!response.ok) {
                let detail = '';
                try {
                    const body = await response.clone().json();
                    detail =
                        typeof body === 'string' ? body : body.message || '';
                } catch (_) {
                    try {
                        detail = await response.text();
                    } catch (_e) {
                        detail = '';
                    }
                }
                throw new Error(detail || 'HTTP ' + response.status);
            }

            const contentType = response.headers.get('content-type') || '';

            // Non-streaming JSON fallback
            if (contentType.includes('application/json')) {
                const data = await response.json();
                bubble.innerHTML = renderMarkdown(data.answer || '');
                this.renderDatasetCards(bubble, data.datasets);
                this.history.push({
                    role: 'assistant',
                    content: data.answer || '',
                });
                return;
            }

            // SSE / streamed text
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let answer = '';
            let started = false;

            const flushAnswer = () => {
                if (!started) {
                    bubble.innerHTML = '';
                    started = true;
                }
                bubble.innerHTML = renderMarkdown(answer);
                this.scrollToBottom();
            };

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                let idx;
                while ((idx = buffer.indexOf('\n\n')) !== -1) {
                    const rawEvent = buffer.slice(0, idx).trim();
                    buffer = buffer.slice(idx + 2);
                    if (!rawEvent.startsWith('data:')) continue;
                    const payload = rawEvent.replace(/^data:\s*/, '');
                    if (payload === '[DONE]') continue;

                    let evt;
                    try {
                        evt = JSON.parse(payload);
                    } catch (_) {
                        // treat as raw token text
                        answer += payload;
                        flushAnswer();
                        continue;
                    }

                    if (evt.type === 'log') {
                        this.logLine(evt);
                    } else if (evt.type === 'usage') {
                        this.updateUsageSummary(evt);
                    } else if (evt.type === 'token') {
                        answer += evt.text || '';
                        flushAnswer();
                    } else if (evt.type === 'datasets') {
                        this.renderDatasetCards(bubble, evt.datasets);
                    } else if (evt.type === 'error') {
                        throw new Error(evt.message || 'stream error');
                    } else if (evt.answer !== undefined) {
                        answer = evt.answer;
                        flushAnswer();
                        this.renderDatasetCards(bubble, evt.datasets);
                    }
                }
            }

            if (!started) bubble.innerHTML = renderMarkdown(answer || '...');
            this.history.push({ role: 'assistant', content: answer });
        }
    }

    window.MasaderChat = MasaderChat;
})();
