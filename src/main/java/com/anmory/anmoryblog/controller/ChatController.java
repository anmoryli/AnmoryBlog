package com.anmory.anmoryblog.controller;

import com.anmory.anmoryblog.service.HistoryService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.util.Map;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-21 上午8:53
 */

@RestController
@RequestMapping("/ai")
public class ChatController {
    @Autowired
    OpenAiChatModel openAiChatModel;
    @Autowired
    HistoryService historyService;
    @RequestMapping("/chat")
    public Flux<String> chat(@RequestBody Map<String, String> message) {
        String message1 = message.get("message");
        historyService.insert(1, message1);
        System.out.println("message:" + message);
        return ChatClient.create(openAiChatModel)
                .prompt("你是一个有用的助手")
                .user(message1)
                .stream()
                .content();
    }
}
