package com.anmory.anmoryblog.mapper;

import com.anmory.anmoryblog.model.Comments;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-05-20 下午1:44
 */

@Mapper
public interface CommentsMapper {
    @Insert("insert into comments(post_id,user_id,content) values(#{postId},#{userId},#{content})")
    int insert(int postId, int userId, String content);

    @Delete("delete from comments where comment_id=#{commentId}")
    int delete(int commentId);

    @Delete("delete from comments where post_id= #{postId}")
    int deleteByPostId(int postId);

    @Select("select * from comments where post_id= #{postId}")
    List<Comments> selectByPostId(int postId);

    @Select("select * from comments where comment_id= #{commentId}")
    List<Comments> selectByCommentId(int commentId);

    @Select("select * from comments")
    List<Comments> selectAll();

    @Select("select * from comments where user_id= #{userId}")
    List<Comments> selectByUserId(int userId);

    @Select("select count(*) from comments")
    int count();
}
