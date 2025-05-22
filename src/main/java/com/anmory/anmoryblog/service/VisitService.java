package com.anmory.anmoryblog.service;

import com.anmory.anmoryblog.mapper.VisitMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-20 下午10:57
 */

@Service
public class VisitService {
    @Autowired
    VisitMapper visitMapper;

    public int updateCount() {
        return visitMapper.updateCount();
    }

    public int selectCount() {
        return visitMapper.selectCount();
    }
}
