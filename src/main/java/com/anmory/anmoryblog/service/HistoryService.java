package com.anmory.anmoryblog.service;

import com.anmory.anmoryblog.mapper.HistoryMapper;
import com.anmory.anmoryblog.model.History;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-20 下午1:41
 */

@Service
public class HistoryService {
    @Autowired
    HistoryMapper historyMapper;

    public int insert(int userId, String content) {
        return historyMapper.insert(userId, content);
    }

    public int delete(int userId) {
        return historyMapper.delete(userId);
    }

    public List<History> selectByUserId(int userId) {
        return historyMapper.selectByUserId(userId);
    }
}
