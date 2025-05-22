package com.anmory.anmoryblog.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-20 上午8:18
 */

@Data
public class Comments {
    private int commentId;
    private int postId;
    private int userId;
    private String content;
    private Date createdAt;
    private Date updatedAt;
}
