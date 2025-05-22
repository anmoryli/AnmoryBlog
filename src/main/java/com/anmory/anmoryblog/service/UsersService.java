package com.anmory.anmoryblog.service;

import com.anmory.anmoryblog.mapper.UsersMapper;
import com.anmory.anmoryblog.model.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-20 上午8:23
 */

@Service
public class UsersService {
    @Autowired
    UsersMapper usersMapper;

    public int insertUser(String username, String password, String email) {
        return usersMapper.insertUser(username, password, email);
    }

    public Users selectUserByName(String username) {
        return usersMapper.selectUserByName(username);
    }

    public Users selectUserById(int userId) {
        return usersMapper.selectUserById(userId);
    }

    public int updateUser(String username, String password, String email, int userId) {
        return usersMapper.updateUser(username, password, email, userId);
    }

    public int deleteUser(int userId) {
        return usersMapper.deleteUser(userId);
    }

    public List<Users> selectAll() {
        return usersMapper.selectAll();
    }
}
