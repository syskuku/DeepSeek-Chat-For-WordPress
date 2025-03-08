jQuery(document).ready(function($) {
    let apiUrl = 'https://api.deepseek.com/chat/completions';
    let isDeepThink = false;
    let context = [];  // 用于保存上下文
    let remainingDeepThink = 10;  // 每天限制使用深度思考5次

    function appendMessage(content, role) {
        let messageClass = role === 'user' ? 'user-message' : 'bot-message';
        let messageBubble = $('<div>').addClass(messageClass).html(content);
        $('#deepseek-chat-body').append(messageBubble);
        $('#deepseek-chat-body').scrollTop($('#deepseek-chat-body')[0].scrollHeight);
    }

    function showTypingEffect() {
        let typingIndicator = $('<div>').addClass('bot-message typing-indicator').text('服务器不繁忙，只是回答得比较慢，所以你先别急…');
        $('#deepseek-chat-body').append(typingIndicator);
        $('#deepseek-chat-body').scrollTop($('#deepseek-chat-body')[0].scrollHeight);
    }

    function removeTypingEffect() {
        $('.typing-indicator').remove();
    }

    function updateTokenInfo(remainingTokens) {
        $('#remaining-tokens').text(remainingTokens);
    }

    function sendMessage(message) {
        if (message.length > 800) {
            appendMessage("对话长度超出限制，请将消息缩短到800字符以内。", 'bot');
            return;
        }

        appendMessage(message, 'user');
        showTypingEffect();
        let messages = context.slice(); // 复制上下文
        messages.push({"role": "user", "content": message}); // 加入当前用户消息
        $.ajax({
            url: apiUrl,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer sk-这里填上你的deepseek api',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                messages: messages,
                model: isDeepThink ? 'deepseek-reasoner' : 'deepseek-chat',
                frequency_penalty: 0,
                max_tokens: 1024,
                presence_penalty: 0,
                temperature: 1.3,
                top_p: 1
            }),
            success: function(response) {
                removeTypingEffect();
                if (isDeepThink) {
                    let reasoning_content = response.choices[0].message.reasoning_content;
                    let content = response.choices[0].message.content;
                    appendMessage("<em>思考过程：" + reasoning_content + "</em>", 'bot');
                    appendMessage(content, 'bot');
                    context.push({"role": "assistant", "content": content}); // 更新上下文
                    remainingDeepThink -= 1;
                    $('#remaining-deepthink').text(remainingDeepThink);
                } else {
                    let completion = response.choices[0].message.content;
                    appendMessage(completion, 'bot');
                    context.push({"role": "assistant", "content": completion}); // 更新上下文
                }
                updateTokenInfo(response.usage.total_tokens);
            }
        });
    }

    $('#deepseek-chat-submit').click(function() {
        let message = $('#deepseek-chat-input').val();
        if (message) {
            sendMessage(message);
            $('#deepseek-chat-input').val('');
        }
    });

    $('#deepseek-chat-deepthink').click(function() {
        if (remainingDeepThink > 0) {
            isDeepThink = !isDeepThink;
            apiUrl = 'https://api.deepseek.com/chat/completions';
            $(this).toggleClass('deepthink-on deepthink-off');
            $(this).text(isDeepThink ? '深度思考 (开/速度较慢)' : '深度思考 (关)');
        } else {
            appendMessage("今天的深度思考次数已用完，请明天再试。", 'bot');
        }
    });

    $('#deepseek-chat-toggle').click(function() {
        $('#deepseek-chat-body, #deepseek-chat-input, #deepseek-chat-submit, #deepseek-chat-deepthink, #deepseek-token-info').toggle();
        if ($(this).text() === '隐藏👇') {
            $('#deepseek-chat').css('bottom', '-400px');
            $(this).text('显示👆');
        } else {
            $('#deepseek-chat').css('bottom', '20px');
            $(this).text('隐藏👇');
        }
    });

    // 初始化token和深度思考次数
    $.ajax({
        url: 'https://api.deepseek.com/tokens',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer sk-你的DeepSeek API',
            'Content-Type': 'application/json'
        },
        success: function(response) {
            updateTokenInfo(response.remaining_tokens);
        }
    });
});
