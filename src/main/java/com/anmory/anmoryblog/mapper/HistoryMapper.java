package com.anmory.anmoryblog.mapper;

import com.anmory.anmoryblog.model.History;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-05-20 下午1:35
 */

@Mapper
public interface HistoryMapper {
    @Insert("insert into history (user_id, content) values (#{userId},#{content})")
    int insert(int userId, String content);

    @Delete("delete from history where user_id=#{userId}")
    int delete(int userId);

    @Select("select * from history where user_id= #{userId}")
    List<History> selectByUserId(int userId);
}
