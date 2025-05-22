package com.anmory.anmoryblog.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-20 上午8:19
 */

@Data
public class History {
    private int historyId;
    private int userId;
    private String content;
    private Date createdAt;
    private Date updatedAt;
}
