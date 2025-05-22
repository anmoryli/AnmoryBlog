package com.anmory.anmoryblog.controller;

import com.anmory.anmoryblog.model.Users;
import com.anmory.anmoryblog.service.UsersService;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-20 下午1:49
 */

@Slf4j
@RestController
@RequestMapping("/users")
public class UsersController {
    @Autowired
    UsersService usersService;

    @RequestMapping("/login")
    public Users login(String username, String password, HttpSession session) {
        log.info("登录名:" + username);
        if(username == null || password == null) {
            return null;
        }
        Users users = usersService.selectUserByName(username);
        if(users == null) {
            log.error("用户不存在");
            return null;
        }
        if(users.getPassword().equals(password)) {
            log.info("用户登录成功");
            session.setAttribute("user", users);
            return users;
        }
        return null;
    }

    @RequestMapping("/register")
    public Users register(String username, String password, String email) {
        if(username == null || password == null || email == null) {
            return null;
        }
        Users users = usersService.selectUserByName(username);
        if(users != null) {
            log.error("用户已存在");
            return null;
        }
        usersService.insertUser(username, password, email);
        return usersService.selectUserByName(username);
    }

    @RequestMapping("/getUserById")
    public Users getUserById(int userId) {
        return usersService.selectUserById(userId);
    }

    @RequestMapping("/selectAll")
    public List<Users> selectAll() {
        return usersService.selectAll();
    }
}
