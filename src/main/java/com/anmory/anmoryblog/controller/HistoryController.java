package com.anmory.anmoryblog.controller;

import com.anmory.anmoryblog.service.HistoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-20 下午2:04
 */

@Slf4j
@RestController
@RequestMapping("/history")
public class HistoryController {
    @Autowired
    HistoryService historyService;

    @RequestMapping("/insert")
    public int insert(int userId, String content) {
        return historyService.insert(userId, content);
    }

    @RequestMapping("/delete")
    public int delete(int userId) {
        return historyService.delete(userId);
    }
}
