package com.anmory.anmoryblog.mapper;

import com.anmory.anmoryblog.model.Users;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-05-20 上午8:21
 */

@Mapper
public interface UsersMapper {
    @Insert("insert into users(username,password,email) values(#{username},#{password},#{email})")
    int insertUser(String username, String password,  String email);

    @Select("select * from users where username=#{username}")
    Users selectUserByName(String username);

    @Select("select * from users where user_id=#{userId}")
    Users selectUserById(int userId);

    @Update("update users set username=#{username},password=#{password},email=#{email} where user_id=#{userId}")
    int updateUser(String username, String password, String email, int userId);

    @Delete("delete from users where user_id=#{userId}")
    int deleteUser(int userId);

    @Select("select * from users")
    List<Users> selectAll();
}
