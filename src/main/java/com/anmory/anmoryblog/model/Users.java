package com.anmory.anmoryblog.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-20 上午8:15
 */

@Data
public class Users {
    private int userId;
    private String username;
    private String password;
    private boolean isAdmin;
    private String email;
    private Date createdAt;
    private Date updatedAt;
}
