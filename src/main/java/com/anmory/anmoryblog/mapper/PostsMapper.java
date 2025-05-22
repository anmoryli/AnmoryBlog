package com.anmory.anmoryblog.mapper;

import com.anmory.anmoryblog.model.Posts;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-05-20 上午8:24
 */

@Mapper
public interface PostsMapper {
    @Insert("insert into posts(title,content,category,url) values " +
            "(#{title},#{content},#{category},#{url})")
    int insertPost(String title, String content, String category, String url);

    @Update("update posts set title=#{title},content=#{content},category=#{category},url=#{url} " +
            "where post_id=#{postId}")
    int updatePost(String title, String content, String category, String url, int postId);

    @Select("select * from posts where post_id= #{postId}")
    Posts selectPostById(int postId);

    @Select("select * from posts where title= #{title}")
    Posts selectByTitle(String title);

    @Select("select * from posts where category= #{category}")
    List<Posts> selectPostsByCategory(String category);

    @Delete("delete from posts where post_id=#{postId}")
    int deletePost(int postId);

    @Select("select * from posts")
    List<Posts> selectAll();

    @Update("update posts set likes=likes+1 where post_id= #{postId}")
    int updateLikes(int postId);

    @Select("select count(*) from posts")
    int selectPostsCount();

    @Select("select sum(likes) from posts")
    int selectTotalLikes();
}
