package com.anmory.anmoryblog.controller;

import com.anmory.anmoryblog.model.Posts;
import com.anmory.anmoryblog.service.CommentsService;
import com.anmory.anmoryblog.service.PostsService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.text.StringEscapeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-20 下午1:54
 */

@Slf4j
@RestController
@RequestMapping("/posts")
public class PostsController {
    @Autowired
    PostsService postsService;
    @Autowired
    CommentsService commentsService;

    @RequestMapping("/insert")
    public int insertPost(String title, String content, String category, String url) {
        return postsService.insertPost(title, content, category, url);
    }

    @RequestMapping("/update")
    public int updatePost(String title, String content, String category, String url, int postId) {
        return postsService.updatePost(title, content, category, url, postId);
    }

    @RequestMapping("/select")
    public Posts selectPostById(int postId) {
        return postsService.selectPostById(postId);
    }

    @RequestMapping("/selectByTitle")
    public Posts selectByTitle(String title) {
        return postsService.selectByTitle(title);
    }

    @RequestMapping("/selectPostsByCategory")
    public List<Posts> selectPostsByCategory(String category) {
        return postsService.selectPostsByCategory(category);
    }

    @RequestMapping("/delete")
    public int deletePost(int postId) {
        commentsService.deleteByPostId(postId);
        return postsService.deletePost(postId);
    }

    @RequestMapping("/selectAll")
    public List<Posts> selectAll() {
        return postsService.selectAll();
    }

    @RequestMapping("/updateLikes")
    public int updateLikes(int postId) {
        return postsService.updateLikes(postId);
    }

//    @GetMapping("/preview/{postId}")
//    public ResponseEntity<String> previewPost(@PathVariable int postId) {
//        Posts post = postsService.selectPostById(postId);
//        if (post == null) {
//            log.warn("文章不存在: postId={}", postId);
//            return new ResponseEntity<>("<html><body><h1>文章不存在</h1></body></html>", HttpStatus.OK);
//        }
//        log.info("正在预览文章: {}", post.getTitle());
//
//        // 如果 post.url 为空，回退显示文章标题和内容
//        if (post.getUrl() == null || post.getUrl().isEmpty()) {
//            log.info("post.url 为空，回退显示文章内容");
//            return new ResponseEntity<>(
//                    "<html><head><style>" +
//                            "body { font-family: Arial, sans-serif; margin: 20px; max-width: 800px; }" +
//                            "h1 { font-size: 1.8em; color: #333; margin-bottom: 15px; }" +
//                            "p { line-height: 1.6; color: #555; }" +
//                            "</style></head><body>" +
//                            "<h1>" + StringEscapeUtils.escapeHtml4(post.getTitle()) + "</h1>" +
//                            "<p>" + StringEscapeUtils.escapeHtml4(post.getContent()) + "</p>" +
//                            "</body></html>",
//                    HttpStatus.OK
//            );
//        }
//
//        // 代理 post.url
//        try {
//            // 配置 RestTemplate
//            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
//            factory.setConnectTimeout(5000); // 5秒连接超时
//            factory.setReadTimeout(10000);   // 10秒读取超时
//            RestTemplate restTemplate = new RestTemplate(factory);
//            restTemplate.getInterceptors().add((request, body, execution) -> {
//                request.getHeaders().add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
//                return execution.execute(request, body);
//            });
//
//            log.info("代理请求: {}", post.getUrl());
//            String content = restTemplate.getForObject(post.getUrl(), String.class);
//            if (content == null || content.trim().isEmpty()) {
//                throw new RuntimeException("返回内容为空");
//            }
//            return new ResponseEntity<>(
//                    "<html><head><style>" +
//                            "body { font-family: Arial, sans-serif; margin: 20px; max-width: 800px; }" +
//                            "</style></head><body>" + content + "</body></html>",
//                    HttpStatus.OK
//            );
//        } catch (Exception e) {
//            log.error("无法加载外部网页: {}", post.getUrl(), e);
//            return new ResponseEntity<>(
//                    "<html><head><style>" +
//                            "body { font-family: Arial, sans-serif; margin: 20px; max-width: 800px; }" +
//                            "h1 { font-size: 1.8em; color: #333; margin-bottom: 15px; }" +
//                            "p { line-height: 1.6; color: #555; }" +
//                            "</style></head><body>" +
//                            "<h1>" + StringEscapeUtils.escapeHtml4(post.getTitle()) + "</h1>" +
//                            "<p>" + StringEscapeUtils.escapeHtml4(post.getContent()) + "</p>" +
//                            "<p>无法加载外部网页: " + StringEscapeUtils.escapeHtml4(post.getUrl()) + "</p>" +
//                            "</body></html>",
//                    HttpStatus.OK
//            );
//        }
//    }

    @RequestMapping("/preview/{postId}")
    public String previewPost(@PathVariable int postId) {
        Posts post = postsService.selectPostById(postId);
        return post.getUrl();
    }

    @RequestMapping("/count")
    public int selectPostsCount() {
        return postsService.selectPostsCount();
    }

    @GetMapping("/likes")
    public int selectTotalLikes() {
        return postsService.selectTotalLikes();
    }
}
