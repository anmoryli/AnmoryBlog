package com.anmory.anmoryblog.controller;

import com.anmory.anmoryblog.service.VisitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-20 下午10:57
 */

@RestController
@RequestMapping("/visit")
public class VisitController {
    @Autowired
    VisitService visitService;

    @RequestMapping("/count")
    public int selectCount() {
        return visitService.selectCount();
    }

    @RequestMapping("/add")
    public int updateCount() {
        return visitService.updateCount();
    }
}
