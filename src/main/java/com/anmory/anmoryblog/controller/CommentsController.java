package com.anmory.anmoryblog.controller;

import com.anmory.anmoryblog.model.Comments;
import com.anmory.anmoryblog.service.CommentsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-20 下午2:01
 */

@Slf4j
@RestController
@RequestMapping("/comments")
public class CommentsController {
    @Autowired
    CommentsService commentsService;

    @RequestMapping("/insert")
    public int insertComment(int postId, int userId, String content) {
        log.info("文章id{},用户id{},内容{}",  postId, userId, content);
        return commentsService.insert(postId, userId, content);
    }

    @RequestMapping("/delete")
    public int deleteComment(int commentId) {
        return commentsService.delete(commentId);
    }

    @RequestMapping("/deleteByPostId")
    public int deleteByPostId(int postId) {
        return commentsService.deleteByPostId(postId);
    }

    @RequestMapping("/selectByPostId")
    public List<Comments> selectByPostId(int postId) {
        log.info("文章id{}", postId);
        System.out.println(commentsService.selectByPostId(postId));
        return commentsService.selectByPostId(postId);
    }

    @RequestMapping("/selectByCommentId")
    public List<Comments> selectByCommentId(int commentId) {
        return commentsService.selectByCommentId(commentId);
    }

    @RequestMapping("/selectAll")
    public List<Comments> selectAll() {
        return commentsService.selectAll();
    }

    @RequestMapping("/selectByUserId")
    public List<Comments> selectByUserId(int userId) {
        return commentsService.selectByUserId(userId);
    }

    @RequestMapping("/count")
    public int count() {
        return commentsService.count();
    }
}
