package com.anmory.anmoryblog.service;

import com.anmory.anmoryblog.mapper.CommentsMapper;
import com.anmory.anmoryblog.model.Comments;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-20 下午1:47
 */

@Service
public class CommentsService {
    @Autowired
    CommentsMapper commentsMapper;

    public int insert(int postId, int userId, String content) {
        return commentsMapper.insert(postId, userId, content);
    }

    public int delete(int commentId) {
        return commentsMapper.delete(commentId);
    }

    public int deleteByPostId(int postId) {
        return commentsMapper.deleteByPostId(postId);
    }

    public List<Comments> selectByPostId(int postId) {
        return commentsMapper.selectByPostId(postId);
    }

    public List<Comments> selectByCommentId(int commentId) {
        return commentsMapper.selectByCommentId(commentId);
    }

    public List<Comments> selectAll() {
        return commentsMapper.selectAll();
    }

    public List<Comments> selectByUserId(int userId) {
        return commentsMapper.selectByUserId(userId);
    }

    public int count() {
        return commentsMapper.count();
    }
}
