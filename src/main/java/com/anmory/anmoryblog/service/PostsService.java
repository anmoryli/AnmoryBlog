package com.anmory.anmoryblog.service;

import com.anmory.anmoryblog.mapper.PostsMapper;
import com.anmory.anmoryblog.model.Posts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-20 上午8:28
 */

@Service
public class PostsService {
    @Autowired
    PostsMapper postsMapper;

    public int insertPost(String title, String content, String category, String url) {
        return postsMapper.insertPost(title, content, category, url);
    }

    public int updatePost(String title, String content, String category, String url, int postId) {
        return postsMapper.updatePost(title, content, category, url, postId);
    }

    public Posts selectPostById(int postId) {
        return postsMapper.selectPostById(postId);
    }

    public Posts selectByTitle(String title) {
        return postsMapper.selectByTitle(title);
    }

    public List<Posts> selectPostsByCategory(String category) {
        return postsMapper.selectPostsByCategory(category);
    }

    public int deletePost(int postId) {
        return postsMapper.deletePost(postId);
    }

    public List<Posts> selectAll() {
        return postsMapper.selectAll();
    }

    public int updateLikes(int postId) {
        return postsMapper.updateLikes(postId);
    }

    public int selectPostsCount() {
        return postsMapper.selectPostsCount();
    }

    public int selectTotalLikes() {
        return postsMapper.selectTotalLikes();
    }
}
