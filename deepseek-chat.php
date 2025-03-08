<?php
/*
Plugin Name: DeepSeek AI for Class5
Description: 在主页右下角添加一个支持上下文的DeepSeek聊天窗口。
Version: 1.0
Author: iMikufans
*/

// 防止直接访问文件
if (!defined('ABSPATH')) {
    exit;
}

// 添加DeepSeek Chat脚本和样式
function deepseek_chat_enqueue_scripts() {
    wp_enqueue_script('deepseek-chat-js', plugins_url('deepseek-chat.js', __FILE__), array('jquery'), '1.0', true);
    wp_enqueue_style('deepseek-chat-css', plugins_url('deepseek-chat.css', __FILE__), array(), '1.0');
}
add_action('wp_enqueue_scripts', 'deepseek_chat_enqueue_scripts');

// 在每个页面底部插入聊天窗口的HTML
function deepseek_chat_add_html() {
    ?>
    <div id="deepseek-chat">
        <div id="deepseek-chat-header">
            <div id="deepseek-logo-container">
                <img src="<?php echo plugins_url('deepseek-logo.png', __FILE__); ?>" alt="DeepSeek">
                <span>DeepSeek AI</span>
                <button id="deepseek-chat-toggle">隐藏</button>
            </div>
        </div>
        <div id="deepseek-chat-body"></div>
        <input type="text" id="deepseek-chat-input" placeholder="输入信息...">
        <button id="deepseek-chat-submit">发送</button>
        <button id="deepseek-chat-deepthink" class="deepthink-off">深度思考 (关)</button>
        <div id="deepseek-token-info">
	本次消耗价格: <span id="remaining-tokens">0</span>/1000000美元 | <br>	Presented by Jiajun Zhang<br>	Powered By DeepSeek AI。
        </div>
    </div>
    <?php
}
add_action('wp_footer', 'deepseek_chat_add_html');
