package com.anmory.anmoryblog.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-20 上午8:17
 */

@Data
public class Posts {
    private int postId;
    private String title;
    private String content;
    private String category;
    private String url;
    private int likes;
    private Date createdAt;
    private Date updatedAt;
}
