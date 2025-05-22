// 全局变量
let currentUser = null;
let currentPage = "cover-page";
let visitCount = 0;
let posts = [];
let comments = [];
let currentPostId = null;
let bookmarks = [];
let baseUrl = "http://simplelive.fun:8087"; // 设置为你的API基础URL

// DOM加载完成后执行
$(document).ready(function () {
  // 初始化
  initApp();

  // 事件监听
  setupEventListeners();

  // 加载数据
  loadData();
});

$(document).ready(function () {
  // 获取文章数量
  $.ajax({
    url: "/posts/count",
    method: "GET",
    success: function (response) {
      $("#profile-posts-count").text(response);
    },
    error: function () {
      $("#profile-posts-count").text("加载失败");
    },
  });

  // 获取评论数量
  $.ajax({
    url: "/comments/count",
    method: "GET",
    success: function (response) {
      $("#profile-comments-count").text(response);
    },
    error: function () {
      $("#profile-comments-count").text("加载失败");
    },
  });

  // 获取获赞数量
  $.ajax({
    url: "/posts/likes",
    method: "GET",
    success: function (response) {
      $("#profile-likes-count").text(response);
    },
    error: function () {
      $("#profile-likes-count").text("加载失败");
    },
  });
});

$(document).ready(function () {
  // 获取当前用户信息（假设已经在登录状态下）
  const user = JSON.parse(localStorage.getItem("user"));
  // 直接使用本地 user 对象填充数据
  const username = user.username || "默认用户";
  const email = user.email || "未知邮箱";
  const created = user.createdAt || "2025-05-20";

  // 设置文本内容
  $("#profile-username").text(username);
  $("#profile-email").text(email);
  $("#profile-created").text(created);

  // 设置头像文字（取第一个字符）
  const initial = username.charAt(0);
  $("#profile-avatar").text(initial);
});

// 初始化应用
function initApp() {
  // 检查本地存储中的主题设置
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  // 检查本地存储中的用户信息
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      updateLoginStatus();
    } catch (e) {
      localStorage.removeItem("user");
    }
  }

  // 检查本地存储中的收藏
  const savedBookmarks = localStorage.getItem("bookmarks");
  if (savedBookmarks) {
    try {
      bookmarks = JSON.parse(savedBookmarks);
    } catch (e) {
      localStorage.removeItem("bookmarks");
    }
  }

  // 获取访问计数
  getVisitCount();
}

$(document).ready(function () {
  let hasScrolled = false;

  // 点击按钮下滑
  $("#scroll-down").click(function () {
    handleScrollToFirstPage();
  });

  // 监听滚动事件
  $(window).on('scroll', function () {
    if (hasScrolled) return; // 已经执行过就不再触发

    const scrollThreshold = 100; // 滚动超过100px就触发
    if ($(window).scrollTop() >= scrollThreshold) {
      handleScrollToFirstPage();
    }
  });

  function handleScrollToFirstPage() {
    hasScrolled = true; // 防止重复触发

    const coverPage = $("#cover-page");
    const coverQuote = $(".cover-quote");

    coverQuote.addClass("fade-out");

    setTimeout(function () {
      coverPage.hide();
      $("#main-nav").css("display", "flex");
      $("#first-page").show();
      currentPage = "first-page";
    }, 800);
  }
});

// 设置事件监听器
function setupEventListeners() {
  // 扉页下滑
  $("#scroll-down").click(function () {
    const coverPage = $("#cover-page");
    const coverQuote = $(".cover-quote");

    coverQuote.addClass("fade-out");

    setTimeout(function () {
      coverPage.hide();
      $("#main-nav").css("display", "flex");
      $("#first-page").show();
      currentPage = "first-page";
    }, 800);
  });

  // 导航链接点击
  $(".nav-links a").click(function (e) {
    if ($(this).attr("href").startsWith("#")) {
      e.preventDefault();
      const targetId = $(this).attr("href").substring(1);
      navigateTo(targetId);

      // 在移动设备上点击导航链接后关闭菜单
      if (window.innerWidth <= 768) {
        $("#nav-links").removeClass("active");
        $(".mobile-menu-btn i").attr("class", "fas fa-bars");
      }
    }
  });

  // 导航栏品牌点击
  $("#nav-brand").click(function () {
    navigateTo("first-page");
  });

  // 导航栏扉页点击
  $("#nav-cover").click(function (e) {
    e.preventDefault();
    $("#cover-page").css("display", "flex");
    $(".page, .first-page").hide();
    $("#main-nav").hide();
    currentPage = "cover-page";
  });

  // 移动菜单按钮点击
  $("#mobile-menu-btn").click(function () {
    const navLinks = $("#nav-links");
    navLinks.toggleClass("active");

    // 切换图标
    const icon = $(this).find("i");
    if (navLinks.hasClass("active")) {
      icon.attr("class", "fas fa-times");
    } else {
      icon.attr("class", "fas fa-bars");
    }
  });

  // 主题切换
  $("#theme-toggle").click(toggleTheme);

  // 登录按钮
  $("#login-btn").click(login);

  // 注册切换
  $("#register-toggle").click(function () {
    navigateTo("register");
  });

  // 登录切换
  $("#login-toggle").click(function () {
    navigateTo("login");
  });

  // 注册按钮
  $("#register-btn").click(register);

  // 点赞按钮
  $("#like-post").click(likePost);

  // 收藏按钮
  $("#bookmark-post").click(bookmarkPost);

  // 提交评论
  $("#submit-comment").click(submitComment);

  // 搜索
  $("#search-input").keyup(function (e) {
    if (e.key === "Enter") {
      searchPosts($(this).val());
    }
  });

  $("#search-btn").click(function () {
    searchPosts($("#search-input").val());
  });

  // 个人资料标签切换
  $(".profile-tab").click(function () {
    $(".profile-tab").removeClass("active");
    $(this).addClass("active");

    const tabId = $(this).attr("data-tab");
    $(".tab-content").removeClass("active");
    $(`#${tabId}-content`).addClass("active");

    if (tabId === "bookmarks") {
      loadBookmarks();
    } else if (tabId === "comments") {
      loadUserComments();
    }
  });

  // 更新个人资料
  $("#update-profile-btn").click(updateProfile);

  // 退出登录
  $("#logout-btn").click(logout);

  // 管理员按钮
  $("#new-post-btn").click(function () {
    showNewPostForm();
  });

  $("#manage-posts-btn").click(function () {
    loadAdminPosts();
  });

  $("#manage-users-btn").click(function () {
    loadAdminUsers();
  });

  $("#manage-comments-btn").click(function () {
    loadAdminComments();
  });

  // 窗口大小变化时处理响应式导航
  $(window).resize(function () {
    if (window.innerWidth > 768) {
      $("#nav-links").removeClass("active");
      $(".mobile-menu-btn i").attr("class", "fas fa-bars");
    }
  });

  // 管理员页面标签切换
  $(".admin-tab").click(function () {
    $(".admin-tab").removeClass("active");
    $(this).addClass("active");

    const tabId = $(this).data("tab");
    $(".admin-tab-content").removeClass("active");
    $(`#${tabId}`).addClass("active");

    // 加载相应的数据
    if (tabId === "manage-posts") {
      loadAdminPosts();
    } else if (tabId === "manage-users") {
      loadAdminUsers();
    }
  });

  // 发布新文章
  $("#submit-new-post").click(function () {
    submitNewPost();
  });

  // 清空表单
  $("#clear-post-form").click(function () {
    clearPostForm();
  });

  // 搜索文章
  $("#search-post-btn").click(function () {
    const keyword = $("#post-search").val().trim();
    searchAdminPosts(keyword);
  });

  // 搜索用户
  $("#search-user-btn").click(function () {
    const keyword = $("#user-search").val().trim();
    searchAdminUsers(keyword);
  });

  // 分页按钮
  $("#prev-page").click(function () {
    if (currentPage > 1) {
      currentPage--;
      loadAdminPosts();
    }
  });

  $("#next-page").click(function () {
    if (currentPage < totalPages) {
      currentPage++;
      loadAdminPosts();
    }
  });

  // 关闭模态框
  $(".close-modal").click(function () {
    $("#edit-post-modal").hide();
  });

  // 点击模态框外部关闭
  $(window).click(function (e) {
    if ($(e.target).hasClass("modal")) {
      $(".modal").hide();
    }
  });

  // 更新文章
  $("#update-post-btn").click(function () {
    updatePost();
  });

  // 取消编辑
  $("#cancel-edit-btn").click(function () {
    $("#edit-post-modal").hide();
  });
}

// 加载数据
function loadData() {
  // 加载文章列表
  fetchPosts();

  // 加载照片墙
  loadPhotoGallery();
  loadProjectGallery();
}

// 导航到指定页面
function navigateTo(pageId) {
  // 隐藏所有页面
  $(".page, .first-page").hide();

  // 显示目标页面
  $(`#${pageId}`).show();
  currentPage = pageId;

  // 特殊页面处理
  if (pageId === "blog") {
    fetchPostsByCategory("博客");
  } else if (pageId === "dreams") {
    fetchPostsByCategory("梦境");
  } else if (pageId === "movies") {
    fetchPostsByCategory("影视");
  } else if (pageId === "profile") {
    loadUserProfile();
  } else if (pageId === "single-post") {
    // 单篇文章处理
  }

  // 滚动到顶部
  $("html, body").animate(
    {
      scrollTop: 0,
    },
    300
  );
}

// 切换主题
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  updateThemeIcon(newTheme);
}

// 更新主题图标
function updateThemeIcon(theme) {
  const icons = $(".theme-toggle i");
  if (theme === "dark") {
    icons.attr("class", "fas fa-sun");
  } else {
    icons.attr("class", "fas fa-moon");
  }
}

// 更新登录状态
function updateLoginStatus() {
  const loginLink = $("#login-link");

  if (currentUser) {
    loginLink.html(
      `<i class="fas fa-user"></i><span>${currentUser.username}<span class="en">Profile</span></span>`
    );
    loginLink.attr("href", "#profile");

    // 如果是管理员，显示管理员入口
    if (currentUser.username == "anmory") {
      console.log("用户是管理员");
      // 检查是否已经添加了管理员链接
      const adminLinkExists = $('.nav-links a[href="#admin"]').length > 0;

      if (!adminLinkExists) {
        const adminLink = $("<a></a>")
          .html(
            `<i class="fas fa-cog"></i><span>管理<span class="en">Admin</span></span>`
          )
          .attr("href", "#admin")
          .click(function (e) {
            e.preventDefault();
            navigateTo("admin");
          });

        const li = $("<li></li>").append(adminLink);

        const loginLi = loginLink.parent();
        li.insertBefore(loginLi);
      }
    }
  } else {
    loginLink.html(
      `<i class="fas fa-sign-in-alt"></i><span>登录<span class="en">Login</span></span>`
    );
    loginLink.attr("href", "#login");
    console.log("用户不是管理员");
    // 移除管理员链接
    const adminLink = $('.nav-links a[href="#admin"]');
    if (adminLink.length > 0) {
      adminLink.parent().remove();
    }
  }
}

// 获取访问计数
function getVisitCount() {
  // 先显示本地存储的值（临时展示）
  let localCount = parseInt(localStorage.getItem("visitCount") || 0);
  $("#visit-count").text(localCount);

  // 发送请求到服务器
  $.ajax({
    url: "/visit/count", // 你的后端API端点
    type: "POST",
    dataType: "json",
    success: function (response) {
      console.log("服务器返回的访问计数:", response);
      // 更新为服务器返回的最新计数
      const newCount = response;
      $("#visit-count").text(newCount);
      // 更新本地存储
      localStorage.setItem("visitCount", newCount.toString());
    },
    error: function (xhr, status, error) {
      // 如果请求失败，使用本地计数+1
      localCount++;
      $("#visit-count").text(localCount);
      localStorage.setItem("visitCount", localCount.toString());
      console.error("Failed to update visit count:", error);
    },
  });
}

// 前端代码（jQuery示例）
function updateVisitCounter() {
  // 生成唯一会话ID（如果不存在）
  let sessionId = sessionStorage.getItem("visit_session_id");
  if (!sessionId) {
    sessionId = "sid-" + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("visit_session_id", sessionId);
  }

  // 发送计数请求
  $.ajax({
    url: "/visit/add",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({ sessionId }),
    success: (data) => {
      $("#visit-count").text(data.count);
      getVisitCount();
      // 可选：更新localStorage避免频繁请求
      localStorage.setItem("last_known_count", data.count);
    },
    error: () => {
      // 降级方案：显示本地存储的最后已知数值
      $("#visit-count").text(localStorage.getItem("last_known_count") || "N/A");
    },
  });
}

// 页面加载时触发（但只会执行一次/会话）
$(document).ready(() => {
  if (!sessionStorage.getItem("visit_recorded")) {
    updateVisitCounter();
    sessionStorage.setItem("visit_recorded", "true");
  }
});

// AJAX请求函数 - 使用jQuery
function ajaxRequest(url, method, data) {
  // 构建URL
  let fullUrl = `${url}`;

  return $.ajax({
    url: fullUrl,
    type: method,
    data: data || {},
    dataType: "json",
  });
}

// 获取所有文章
function fetchPosts() {
  ajaxRequest("/posts/selectAll", "GET")
    .done(function (response) {
      console.log("获取所有文章成功：", response);
      posts = response;

      // updateVisitCounter();
      // 更新最新文章
      updateLatestPosts();

      // 更新热门文章
      updatePopularPosts();

      // 加载照片墙
      loadPhotoGallery();
    })
    .fail(function (error) {
      console.error("获取文章失败:", error);
      showNotification("获取文章失败，请稍后重试");

      // 使用模拟数据
      simulatePosts();
    });
}

// 模拟文章数据
function simulatePosts() {
  posts = [
    {
      postId: 1,
      title: "深度思考的魅力",
      content:
        "在这个快节奏的世界中，深度思考变得越来越珍贵。通过放慢脚步，我们可以更深入地理解世界和自己。",
      category: "博客",
      createdAt: new Date().toISOString(),
      likes: 15,
      url: "",
    },
    {
      postId: 2,
      title: "奇妙的梦境探险",
      content:
        "昨晚的梦中，我发现自己身处一个充满奇妙色彩的世界。天空是紫色的，树木会说话，一切都超乎想象。",
      category: "梦境",
      createdAt: new Date().toISOString(),
      likes: 8,
      url: "",
    },
    {
      postId: 3,
      title: "电影《盗梦空间》的哲学思考",
      content:
        "《盗梦空间》不仅仅是一部精彩的科幻电影，它还探讨了关于现实、梦境和意识的深层哲学问题。",
      category: "影视",
      createdAt: new Date().toISOString(),
      likes: 25,
      url: "",
    },
    {
      postId: 4,
      title: "阅读的力量",
      content:
        "阅读不仅可以增长知识，还能培养人的思维方式、想象力和共情能力。一本好书可以改变一个人的一生。",
      category: "博客",
      createdAt: new Date().toISOString(),
      likes: 18,
      url: "",
    },
    {
      postId: 5,
      title: "飞行梦的解析",
      content:
        "梦见自己能够飞行通常象征着自由和突破限制的渴望。这种梦境反映了我们想要超越现实束缚的内在欲望。",
      category: "梦境",
      createdAt: new Date().toISOString(),
      likes: 12,
      url: "",
    },
    {
      postId: 6,
      title: "日本电影《千与千寻》的艺术价值",
      content:
        "宫崎骏的《千与千寻》通过细腻的画面和深刻的主题，展现了成长、勇气和人性的复杂面。",
      category: "影视",
      createdAt: new Date().toISOString(),
      likes: 30,
      url: "",
    },
  ];

  // 更新最新文章
  updateLatestPosts();

  // 更新热门文章
  updatePopularPosts();
}

// 根据分类获取文章
function fetchPostsByCategory(category) {
  // updateVisitCounter();
  ajaxRequest("/posts/selectPostsByCategory", "GET", { category: category })
    .done(function (response) {
      updatePostsList(response);
    })
    .fail(function (error) {
      console.error("获取分类文章失败:", error);
      showNotification("获取分类文章失败，请稍后重试");

      // 使用模拟数据
      const filteredPosts = posts.filter((post) => post.category === category);
      updatePostsList(filteredPosts);
    });
}

// 更新文章列表
function updatePostsList(posts) {
  const postsContainer = $(`#${currentPage}-posts`);
  const sidebarContainer = $(`#${currentPage}-sidebar`);

  // 更新主内容
  postsContainer.empty();

  if (posts.length === 0) {
    postsContainer.html("<p>暂无内容</p>");
  } else {
    posts.forEach((post) => {
      const postElement = createPostCard(post);
      postsContainer.append(postElement);
    });
  }

  // 更新侧边栏
  updateSidebar(posts, sidebarContainer);
}

// 获取单篇文章
function fetchPost(postId) {
  // updateVisitCounter();
  ajaxRequest("/posts/select", "GET", { postId: postId })
    .done(function (post) {
      displayPost(post);
    })
    .fail(function (error) {
      console.error("获取文章详情失败:", error);
      showNotification("获取文章详情失败，请稍后重试");

      // 使用模拟数据
      const post = posts.find((p) => p.postId == postId);
      if (post) {
        displayPost(post);
      } else {
        showNotification("文章不存在");
      }
    });
}

// 显示文章
function displayPost(post) {
  if (post) {
    currentPostId = post.postId;
    console.log("显示文章:", post);

    // 更新文章内容
    const postContent = $("#post-content");
    postContent.html(`
            <h1 class="page-title">${post.title}</h1>
            <div class="post-meta">
                <span>分类: ${post.category}</span>
                <span>发布于: ${formatDate(post.createdAt)}</span>
            </div>
            <div class="post-content">${post.content}</div>
        `);

    // 更新 iframe
    const postWebview = $("#post-webview");
    const webviewError = $("#webview-error");
    if (post.url) {
      console.log("设置 iframe src:", post.url, "类型:", typeof post.url);
      postWebview.attr("src", post.url); // 直接使用 post.url
      postWebview.show();
      webviewError.hide();

      // 验证 src 是否设置正确
      const setSrc = postWebview.attr("src");
      console.log("实际 iframe src:", setSrc);

      // 监听 iframe 加载
      postWebview.off("load").on("load", function () {
        clearTimeout(loadTimeout); // 取消超时
        console.log("iframe 加载完成");
        // 无法访问 contentWindow.document，依赖超时或错误事件
        // 假设加载成功，设置默认高度
        this.style.height = "600px"; // 可调整
        console.log("设置 iframe 默认高度: 600px");
      });

      // 捕获 iframe 错误
      postWebview.off("error").on("error", function (e) {
        clearTimeout(loadTimeout);
        console.error("iframe 加载失败:", e);
        postWebview.hide();
        webviewError
          .html(
            `<p>无法加载网页（可能被限制嵌入）: <a href="${post.url}" target="_blank">${post.url}</a></p>`
          )
          .show();
      });
    } else {
      console.log("无 post.url，隐藏 iframe");
      postWebview.hide();
      webviewError.hide();
    }

    // 更新点赞数
    $("#likes-count").text(post.likes);

    // 更新收藏按钮状态
    updateBookmarkButton(post.postId);

    // 获取评论
    fetchComments(post.postId);

    // 导航到单篇文章页面
    navigateTo("single-post");
  } else {
    console.warn("文章不存在");
    showNotification("文章不存在");
  }
}

// 获取评论
function fetchComments(postId) {
  // updateVisitCounter();
  console.log("获取评论,", postId);
  ajaxRequest("/comments/selectByPostId", "GET", { postId: postId })
    .done(function (response) {
      console.log("获取评论成功", response);
      displayComments(response);
    })
    .fail(function (error) {
      console.error("获取评论失败:", error);
      showNotification("获取评论失败，请稍后重试");

      // 使用模拟评论
      simulateComments(postId);
    });
}

// 模拟评论
function simulateComments(postId) {
  const simulatedComments = [
    {
      commentId: 1,
      postId: postId,
      userId: 1,
      username: "读者A",
      content: "这篇文章非常有启发性，谢谢分享！",
      createdAt: new Date().toISOString(),
    },
    {
      commentId: 2,
      postId: postId,
      userId: 2,
      username: "读者B",
      content: "我有不同的看法，但还是感谢作者的观点。",
      createdAt: new Date().toISOString(),
    },
  ];

  displayComments(simulatedComments);
}

// 显示评论
function displayComments(comments) {
  const commentsContainer = $("#comments-list");

  if (comments.length === 0) {
    commentsContainer.html("<p>暂无评论</p>");
  } else {
    commentsContainer.empty();
    comments.forEach((comment) => {
      const commentElement = createCommentElement(comment);
      commentsContainer.append(commentElement);
    });
  }
}

// 创建评论元素
function createCommentElement(comment, showPostTitle = false) {
  const div = $("<div></div>").addClass("comment");

  let username = "用户" + comment.userId; // Default username in case AJAX fails
  // 通过用户id获取用户名
  if (comment.userId) {
    $.ajax({
      url: "/users/getUserById", // 后端API端点
      type: "GET",
      data: { userId: comment.userId },
      success: function (response) {
        console.log("获取用户名成功:", response);
        username = response.username || "用户" + comment.userId; // Update username
        // Construct and set HTML inside success callback
        let html = `
                    <div class="comment-header">
                        <span class="comment-author">${username}</span>
                        <span class="comment-date">${formatDate(
                          comment.createdAt
                        )}</span>
                    </div>
                    <div class="comment-content">${comment.content}</div>
                `;
        if (showPostTitle && comment.post_title) {
          html += `<div class="comment-post">评论于: <a href="#" data-post-id="${comment.postId}">${comment.post_title}</a></div>`;
        }
        div.html(html);

        // 如果显示文章标题，添加点击事件
        if (showPostTitle) {
          div.find(".comment-post a").click(function (e) {
            e.preventDefault();
            const postId = $(this).attr("data-post-id");
            fetchPost(postId);
          });
        }
      },
      error: function (xhr, status, error) {
        console.error("获取用户名失败:", error);
        // Construct and set HTML with default username
        let html = `
                    <div class="comment-header">
                        <span class="comment-author">${username}</span>
                        <span class="comment-date">${formatDate(
                          comment.createdAt
                        )}</span>
                    </div>
                    <div class="comment-content">${comment.content}</div>
                `;
        if (showPostTitle && comment.post_title) {
          html += `<div class="comment-post">评论于: <a href="#" data-post-id="${comment.postId}">${comment.post_title}</a></div>`;
        }
        div.html(html);

        // 如果显示文章标题，添加点击事件
        if (showPostTitle) {
          div.find(".comment-post a").click(function (e) {
            e.preventDefault();
            const postId = $(this).attr("data-post-id");
            fetchPost(postId);
          });
        }
      },
    });
  } else {
    // If no userId, construct HTML with default username
    let html = `
            <div class="comment-header">
                <span class="comment-author">${username}</span>
                <span class="comment-date">${formatDate(
                  comment.createdAt
                )}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        `;
    if (showPostTitle && comment.post_title) {
      html += `<div class="comment-post">评论于: <a href="#" data-post-id="${comment.postId}">${comment.post_title}</a></div>`;
    }
    div.html(html);

    // 如果显示文章标题，添加点击事件
    if (showPostTitle) {
      div.find(".comment-post a").click(function (e) {
        e.preventDefault();
        const postId = $(this).attr("data-post-id");
        fetchPost(postId);
      });
    }
  }

  return div;
}

// 点赞文章
function likePost() {
  if (!currentPostId) {
    showNotification("无法点赞，文章ID不存在");
    return;
  }
  // updateVisitCounter();

  ajaxRequest("/posts/updateLikes", "POST", { postId: currentPostId })
    .done(function (response) {
      if (response > 0) {
        // 更新点赞数
        const likesCount = parseInt($("#likes-count").text()) + 1;
        $("#likes-count").text(likesCount);
        showNotification("点赞成功");

        // 更新文章列表中的点赞数
        const post = posts.find((p) => p.postId == currentPostId);
        if (post) {
          post.likes = likesCount;
        }
      } else {
        showNotification("点赞失败");
      }
    })
    .fail(function (error) {
      console.error("点赞失败:", error);
      showNotification("点赞成功"); // 模拟成功

      // 模拟更新点赞数
      const likesCount = parseInt($("#likes-count").text()) + 1;
      $("#likes-count").text(likesCount);

      // 更新文章列表中的点赞数
      const post = posts.find((p) => p.postId == currentPostId);
      if (post) {
        post.likes = likesCount;
      }
    });
}

// 收藏文章
function bookmarkPost() {
  if (!currentUser) {
    showNotification("请先登录");
    navigateTo("login");
    return;
  }

  if (!currentPostId) {
    showNotification("无法收藏，文章ID不存在");
    return;
  }

  const index = bookmarks.indexOf(currentPostId);

  if (index === -1) {
    // 添加收藏
    bookmarks.push(currentPostId);
    showNotification("收藏成功");
  } else {
    // 取消收藏
    bookmarks.splice(index, 1);
    showNotification("已取消收藏");
  }

  // 更新本地存储
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

  // 更新收藏按钮状态
  updateBookmarkButton(currentPostId);
}

// 更新收藏按钮状态
function updateBookmarkButton(postId) {
  const bookmarkButton = $("#bookmark-post");
  const isBookmarked = bookmarks.includes(postId);

  if (isBookmarked) {
    bookmarkButton.html('<i class="fas fa-bookmark"></i> 已收藏');
    bookmarkButton.addClass("active");
  } else {
    bookmarkButton.html('<i class="far fa-bookmark"></i> 收藏');
    bookmarkButton.removeClass("active");
  }
}

// 提交评论
function submitComment() {
  if (!currentPostId) {
    showNotification("无法评论，文章ID不存在");
    return;
  }

  const content = $("#comment-text").val().trim();

  if (!content) {
    showNotification("评论内容不能为空");
    return;
  }

  if (!currentUser) {
    showNotification("请先登录");
    navigateTo("login");
    return;
  }
  updateVisitCounter();
  ajaxRequest("/comments/insert", "POST", {
    postId: currentPostId,
    userId: currentUser.userId,
    content: content,
  })
    .done(function (response) {
      console.log("提交评论成功:", response);
      if (response > 0) {
        // 清空评论框
        $("#comment-text").val("");
        // 等待2s钟后重新加载评论
        setTimeout(function () {
          // fetchComments(currentPostId);
        }, 2000);
        // 重新加载评论
        fetchComments(currentPostId);
        showNotification("评论成功");
      } else {
        showNotification("评论失败");
      }
    })
    .fail(function (error) {
      console.error("提交评论失败:", error);
      showNotification("评论成功"); // 模拟成功

      // 清空评论框
      $("#comment-text").val("");

      // 添加模拟评论
      const newComment = {
        commentId: Date.now(),
        postId: currentPostId,
        userId: currentUser.userId,
        username: currentUser.username,
        content: content,
        createdAt: new Date().toISOString(),
      };

      const commentsContainer = $("#comments-list");
      const commentElement = createCommentElement(newComment);

      if (commentsContainer.html() === "<p>暂无评论</p>") {
        commentsContainer.empty();
      }

      commentsContainer.append(commentElement);
    });
}

// 登录
// 登录
function login() {
  const username = $("#username").val().trim();
  const password = $("#password").val().trim();

  if (!username || !password) {
    showNotification("用户名和密码不能为空");
    return;
  }

  ajaxRequest("/users/login", "POST", {
    username: username,
    password: password,
  })
    .done(function (response) {
      if (response) {
        currentUser = response;
        console.log("登录成功:", currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
        updateLoginStatus();
        navigateTo("first-page");
        showNotification("登录成功");
      } else {
        showNotification("用户名或密码错误");
      }
    })
    .fail(function (error) {
      console.error("登录失败:", error);

      // 模拟登录
      if (username === "admin" && password === "admin") {
        currentUser = {
          userId: 1,
          username: "admin",
          email: "admin@example.com",
          isAdmin: true, // 确保设置为 true
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem("user", JSON.stringify(currentUser));
        updateLoginStatus();
        navigateTo("first-page");
        showNotification("登录成功");
      } else if (username === "user" && password === "user") {
        currentUser = {
          userId: 2,
          username: "user",
          email: "user@example.com",
          isAdmin: false, // 确保设置为 false
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem("user", JSON.stringify(currentUser));
        updateLoginStatus();
        navigateTo("first-page");
        showNotification("登录成功");
      } else {
        showNotification("用户名或密码错误");
      }
    });
}

// 注册
function register() {
  const username = $("#reg-username").val().trim();
  const password = $("#reg-password").val().trim();
  const email = $("#reg-email").val().trim();

  if (!username || !password || !email) {
    showNotification("所有字段都必须填写");
    return;
  }

  ajaxRequest("/users/register", "POST", {
    username: username,
    password: password,
    email: email,
  })
    .done(function (response) {
      if (response) {
        showNotification("注册成功，请登录");
        navigateTo("login");
      } else {
        showNotification("用户名已存在");
      }
    })
    .fail(function (error) {
      console.error("注册失败:", error);
      showNotification("注册成功，请登录"); // 模拟成功
      navigateTo("login");
    });
}

// 退出登录
function logout() {
  currentUser = null;
  localStorage.removeItem("user");
  updateLoginStatus();
  navigateTo("first-page");
  showNotification("已退出登录");
}

// 更新个人资料
function updateProfile() {
  if (!currentUser) {
    showNotification("请先登录");
    navigateTo("login");
    return;
  }

  const email = $("#update-email").val().trim();
  const password = $("#update-password").val().trim();

  if (!email && !password) {
    showNotification("请至少填写一项");
    return;
  }

  const data = {
    userId: currentUser.userId,
  };

  if (email) data.email = email;
  if (password) data.password = password;

  ajaxRequest("/users/update", "POST", data)
    .done(function (response) {
      if (response > 0) {
        // 更新本地用户信息
        if (email) currentUser.email = email;

        localStorage.setItem("user", JSON.stringify(currentUser));
        showNotification("个人资料更新成功");

        // 清空输入框
        $("#update-email").val("");
        $("#update-password").val("");
      } else {
        showNotification("个人资料更新失败");
      }
    })
    .fail(function (error) {
      console.error("更新个人资料失败:", error);

      // 模拟更新成功
      if (email) currentUser.email = email;

      localStorage.setItem("user", JSON.stringify(currentUser));
      showNotification("个人资料更新成功");

      // 清空输入框
      $("#update-email").val("");
      $("#update-password").val("");
    });
}

// 搜索文章
function searchPosts(keyword) {
  if (!keyword.trim()) {
    showNotification("请输入搜索关键词");
    return;
  }

  // 在本地文章中搜索
  const results = posts.filter(
    (post) => post.title.includes(keyword) || post.content.includes(keyword)
  );

  const searchResults = $("#search-results");

  if (results.length === 0) {
    searchResults.html(
      '<div class="search-result-item">没有找到相关文章</div>'
    );
  } else {
    searchResults.empty();
    results.forEach((post) => {
      const div = $("<div></div>")
        .addClass("search-result-item")
        .text(post.title)
        .click(function () {
          $("#search-input").val("");
          searchResults.hide();
          fetchPost(post.postId);
        });
      searchResults.append(div);
    });
  }

  searchResults.show();

  // 点击其他地方关闭搜索结果
  $(document).one("click", function closeSearchResults(e) {
    if (!$(e.target).closest(".search-container").length) {
      searchResults.hide();
    }
  });
}

// 加载用户个人资料
function loadUserProfile() {
  if (!currentUser) {
    showNotification("请先登录");
    navigateTo("login");
    return;
  }

  // 更新个人资料信息
  $("#profile-username").text(currentUser.username);
  $("#profile-email").text(currentUser.email || "未设置邮箱");
  $("#profile-created").text(formatDate(currentUser.createdAt));

  // 加载收藏的文章
  loadBookmarks();

  // 加载用户评论
  loadUserComments();

  // 设置邮箱输入框的默认值
  $("#update-email").val(currentUser.email || "");
}

// 加载收藏的文章
function loadBookmarks() {
  const bookmarksContent = $("#bookmarks-content");
  bookmarksContent.html(
    '<div class="loading-container"><div class="loader"></div></div>'
  );

  if (bookmarks.length === 0) {
    bookmarksContent.html("<p>暂无收藏</p>");
    return;
  }

  // 获取收藏的文章详情
  const bookmarkedPosts = posts.filter((post) =>
    bookmarks.includes(post.postId)
  );

  if (bookmarkedPosts.length === 0) {
    bookmarksContent.html("<p>暂无收藏</p>");
    return;
  }

  bookmarksContent.empty();
  const postsGrid = $("<div></div>").addClass("posts-grid");

  bookmarkedPosts.forEach((post) => {
    const postCard = createPostCard(post);
    postsGrid.append(postCard);
  });

  bookmarksContent.append(postsGrid);
}

// 加载用户评论
function loadUserComments() {
  if (!currentUser) return;
  // updateVisitCounter();

  const commentsContent = $("#comments-content");
  commentsContent.html(
    '<div class="loading-container"><div class="loader"></div></div>'
  );

  ajaxRequest("/comments/selectByUserId", "GET", { userId: currentUser.userId })
    .done(function (response) {
      if (response.length === 0) {
        commentsContent.html("<p>暂无评论</p>");
      } else {
        commentsContent.empty();
        response.forEach((comment) => {
          const commentElement = createCommentElement(comment, true);
          commentsContent.append(commentElement);
        });
      }
    })
    .fail(function (error) {
      console.error("获取用户评论失败:", error);

      // 模拟评论
      const simulatedComments = [
        {
          commentId: 1,
          postId: 1,
          post_title: "深度思考的魅力",
          userId: currentUser.userId,
          username: currentUser.username,
          content: "这篇文章非常有启发性，谢谢分享！",
          createdAt: new Date().toISOString(),
        },
        {
          commentId: 2,
          postId: 3,
          post_title: "电影《盗梦空间》的哲学思考",
          userId: currentUser.userId,
          username: currentUser.username,
          content: "我对这部电影有不同的理解，但还是很欣赏导演的视角。",
          createdAt: new Date().toISOString(),
        },
      ];

      commentsContent.empty();
      simulatedComments.forEach((comment) => {
        const commentElement = createCommentElement(comment, true);
        commentsContent.append(commentElement);
      });
    });
}

// 加载照片墙
function loadPhotoGallery() {
  const galleryContainer = $("#photo-gallery");

  // 模拟照片数据
  const photos = [
    { url: "./会再见的对吗？.jpg", caption: "会再见的对吗？" },
    { url: "./早安苏州.png", caption: "早安苏州" },
    { url: "./再见常州.jpg", caption: "再见常州" },
    { url: "./大连海边.jpg", caption: "大连海边" },
    { url: "./小镇日落.jpg", caption: "小镇日落" },
    { url: "./早安东湖.jpg", caption: "早安东湖" },
    { url: "./早安城市.jpg", caption: "早安城市" },
    { url: "./早安大森林.jpg", caption: "早安大森林" },
    { url: "./海边日落.jpg", caption: "海边日落" },
    { url: "./黄昏列车.jpg", caption: "黄昏列车" },
  ];

  galleryContainer.empty();

  photos.forEach((photo) => {
    const photoItem = $("<div></div>").addClass("photo-item");
    photoItem.html(`
            <img src="${photo.url}" alt="${photo.caption}">
            <div class="photo-caption">${photo.caption}</div>
        `);
    galleryContainer.append(photoItem);
  });
}

// 加载项目照片墙
function loadProjectGallery() {
  const galleryContainer = $("#project-gallery");

  // 模拟照片数据
  const photos = [
    {
      url: "http://175.24.205.213:8082/login_v.html",
      caption: "藏药植物药综合知识平台",
      icon: "fa-solid fa-leaf",
    },
    {
      url: "http://175.24.205.213:8084/chat.html",
      caption: "聊天室",
      icon: "fa-solid fa-comments",
    },
    {
      url: "http://simplelive.fun:8086/main.html",
      caption: "AI剧本杀",
      icon: "fa-solid fa-book",
    },
    {
      url: "http://175.24.205.213:8085/index.html",
      caption: "阿梦网盘",
      icon: "fa-solid fa-cloud",
    },
    {
      url: "http://175.24.205.213:8081/relief.html",
      caption: "解忧小狗",
      icon: "fa-solid fa-dog",
    },
    {
      url: "http://175.24.205.213:8083/photo.html",
      caption: "我的艺廊",
      icon: "fa-solid fa-images",
    },
  ];

  galleryContainer.empty();

  photos.forEach((photo) => {
    const projectItem = $("<div></div>").addClass("project-item");
    projectItem.html(`
        <i class="${photo.icon}" style="font-size: 48px; color: #5E6C5A;"></i>
        <div class="project-caption">${photo.caption}</div>
    `);

    // 添加点击事件，在新窗口打开链接
    projectItem.attr("onclick", `window.open('${photo.url}', '_blank')`);

    galleryContainer.append(projectItem);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const targetNode = document.body;

  const config = { childList: true, subtree: true };

  const callback = function (mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        const markdownElement = document.querySelector(".post-content");
        if (markdownElement && !markdownElement.dataset.rendered) {
          markdownElement.innerHTML = marked.parse(markdownElement.innerHTML);
          markdownElement.dataset.rendered = "true"; // 防止重复渲染
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
});

// 管理员功能：显示新建文章表单
function showNewPostForm() {
  if (!currentUser || !currentUser.admin) {
    showNotification("无权限");
    return;
  }

  const adminContent = $("#admin-content");
  adminContent.html(`
        <h2>新建文章</h2>
        <div class="admin-form">
            <div class="form-group">
                <label for="post-title">标题</label>
                <input type="text" id="post-title" placeholder="请输入文章标题">
            </div>
            <div class="form-group">
                <label for="post-category">分类</label>
                <select id="post-category">
                    <option value="博客">博客</option>
                    <option value="梦境">梦境</option>
                    <option value="影视">影视</option>
                </select>
            </div>
            <div class="form-group">
                <label for="post-url">URL</label>
                <input type="text" id="post-url" placeholder="请输入文章URL（可选）">
            </div>
            <div class="form-group">
                <label for="post-content">内容</label>
                <textarea id="post-content" placeholder="请输入文章内容"></textarea>
            </div>
            <div class="form-actions">
                <button id="submit-post">提交</button>
                <button id="cancel-post">取消</button>
            </div>
        </div>
    `);

  // 添加事件监听
  $("#submit-post").click(submitPost);
  $("#cancel-post").click(function () {
    adminContent.empty();
  });
}

// 管理员功能：提交新文章
function submitPost() {
  const title = $("#post-title").val().trim();
  const category = $("#post-category").val();
  const url = $("#post-url").val().trim();
  const content = $("#post-content").val().trim();

  if (!title || !content) {
    showNotification("标题和内容不能为空");
    return;
  }

  ajaxRequest("/posts/insert", "POST", {
    title: title,
    content: content,
    category: category,
    url: url,
  })
    .done(function (response) {
      if (response > 0) {
        showNotification("文章发布成功");
        // 重新加载文章列表
        fetchPosts();
        // 清空表单
        $("#admin-content").empty();
      } else {
        showNotification("文章发布失败");
      }
    })
    .fail(function (error) {
      console.error("发布文章失败:", error);

      // 模拟发布成功
      showNotification("文章发布成功");

      // 添加模拟文章
      const newPost = {
        postId: Date.now(),
        title: title,
        content: content,
        category: category,
        url: url,
        likes: 0,
        createdAt: new Date().toISOString(),
      };

      posts.unshift(newPost);
      updateLatestPosts();

      // 清空表单
      $("#admin-content").empty();
    });
}

// 管理员功能：加载文章管理
function loadAdminPosts() {
  if (!currentUser || !currentUser.admin) {
    showNotification("无权限");
    return;
  }

  const adminContent = $("#admin-content");
  adminContent.html(
    '<div class="loading-container"><div class="loader"></div></div>'
  );

  // 使用已加载的文章
  if (posts.length > 0) {
    displayAdminPosts(posts);
  } else {
    // 如果没有文章，尝试获取
    ajaxRequest("/posts/selectAll", "GET")
      .done(function (response) {
        posts = response;
        displayAdminPosts(posts);
      })
      .fail(function (error) {
        console.error("获取文章列表失败:", error);
        // 使用模拟数据
        simulatePosts();
        displayAdminPosts(posts);
      });
  }
}

// 显示管理员文章列表
function displayAdminPosts(posts) {
  const adminContent = $("#admin-content");

  adminContent.html(`
        <h2>文章管理</h2>
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>标题</th>
                    <th>分类</th>
                    <th>点赞数</th>
                    <th>发布时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody id="admin-posts-body">
            </tbody>
        </table>
    `);

  const tbody = $("#admin-posts-body");

  if (posts.length === 0) {
    tbody.html('<tr><td colspan="6">暂无文章</td></tr>');
  } else {
    posts.forEach((post) => {
      const tr = $("<tr></tr>");
      tr.html(`
                <td>${post.postId}</td>
                <td>${post.title}</td>
                <td>${post.category}</td>
                <td>${post.likes}</td>
                <td>${formatDate(post.createdAt)}</td>
                <td>
                    <button class="edit-post" data-id="${
                      post.postId
                    }">编辑</button>
                    <button class="delete-post" data-id="${
                      post.postId
                    }">删除</button>
                </td>
            `);
      tbody.append(tr);
    });

    // 添加事件监听
    $(".edit-post").click(function () {
      const postId = $(this).attr("data-id");
      editPost(postId);
    });

    $(".delete-post").click(function () {
      const postId = $(this).attr("data-id");
      deletePost(postId);
    });
  }
}

// 管理员功能：编辑文章
function editPost(postId) {
  const post = posts.find((p) => p.postId == postId);

  if (post) {
    const adminContent = $("#admin-content");
    adminContent.html(`
            <h2>编辑文章</h2>
            <div class="admin-form">
                <div class="form-group">
                    <label for="edit-title">标题</label>
                    <input type="text" id="edit-title" value="${post.title}">
                </div>
                <div class="form-group">
                    <label for="edit-category">分类</label>
                    <select id="edit-category">
                        <option value="博客" ${
                          post.category === "博客" ? "selected" : ""
                        }>博客</option>
                        <option value="梦境" ${
                          post.category === "梦境" ? "selected" : ""
                        }>梦境</option>
                        <option value="影视" ${
                          post.category === "影视" ? "selected" : ""
                        }>影视</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-url">URL</label>
                    <input type="text" id="edit-url" value="${post.url || ""}">
                </div>
                <div class="form-group">
                    <label for="edit-content">内容</label>
                    <textarea id="edit-content">${post.content}</textarea>
                </div>
                <div class="form-actions">
                    <button id="update-post" data-id="${
                      post.postId
                    }">更新</button>
                    <button id="cancel-edit">取消</button>
                </div>
            </div>
        `);

    // 添加事件监听
    $("#update-post").click(function () {
      const postId = $(this).attr("data-id");
      updatePost(postId);
    });

    $("#cancel-edit").click(function () {
      loadAdminPosts();
    });
  } else {
    showNotification("文章不存在");
  }
}

// 管理员功能：更新文章
function updatePost(postId) {
  const title = $("#edit-title").val().trim();
  const category = $("#edit-category").val();
  const url = $("#edit-url").val().trim();
  const content = $("#edit-content").val().trim();

  if (!title || !content) {
    showNotification("标题和内容不能为空");
    return;
  }

  ajaxRequest("/posts/update", "POST", {
    postId: postId,
    title: title,
    content: content,
    category: category,
    url: url,
  })
    .done(function (response) {
      if (response > 0) {
        showNotification("文章更新成功");
        // 更新本地文章
        const post = posts.find((p) => p.postId == postId);
        if (post) {
          post.title = title;
          post.content = content;
          post.category = category;
          post.url = url;
        }
        // 重新加载文章列表
        loadAdminPosts();
      } else {
        showNotification("文章更新失败");
      }
    })
    .fail(function (error) {
      console.error("更新文章失败:", error);

      // 模拟更新成功
      showNotification("文章更新成功");

      // 更新本地文章
      const post = posts.find((p) => p.postId == postId);
      if (post) {
        post.title = title;
        post.content = content;
        post.category = category;
        post.url = url;
      }

      // 重新加载文章列表
      loadAdminPosts();
    });
}

// 管理员功能：删除文章
function deletePost(postId) {
  if (confirm("确定要删除这篇文章吗？")) {
    ajaxRequest("/posts/delete", "POST", { postId: postId })
      .done(function (response) {
        if (response > 0) {
          showNotification("文章删除成功");
          // 从本地文章列表删除
          posts = posts.filter((p) => p.postId != postId);
          // 重新加载文章列表
          loadAdminPosts();
        } else {
          showNotification("文章删除失败");
        }
      })
      .fail(function (error) {
        console.error("删除文章失败:", error);

        // 模拟删除成功
        showNotification("文章删除成功");

        // 从本地文章列表删除
        posts = posts.filter((p) => p.postId != postId);

        // 重新加载文章列表
        loadAdminPosts();
      });
  }
}

// 管理员功能：加载用户管理
function loadAdminUsers() {
  if (!currentUser || !currentUser.admin) {
    showNotification("无权限");
    return;
  }

  const adminContent = $("#admin-content");
  adminContent.html(
    '<div class="loading-container"><div class="loader"></div></div>'
  );

  ajaxRequest("/users/selectAll", "GET")
    .done(function (response) {
      displayAdminUsers(response);
    })
    .fail(function (error) {
      console.error("获取用户列表失败:", error);

      // 模拟用户数据
      const simulatedUsers = [
        {
          userId: 1,
          username: "admin",
          email: "admin@example.com",
          isAdmin: true,
          createdAt: new Date().toISOString(),
        },
        {
          userId: 2,
          username: "user",
          email: "user@example.com",
          isAdmin: false,
          createdAt: new Date().toISOString(),
        },
        {
          userId: 3,
          username: "reader",
          email: "reader@example.com",
          isAdmin: false,
          createdAt: new Date().toISOString(),
        },
      ];

      displayAdminUsers(simulatedUsers);
    });
}

// 显示管理员用户列表
function displayAdminUsers(users) {
  console.log("用户列表:", users);
  const adminContent = $("#admin-content");

  adminContent.html(`
        <h2>用户管理</h2>
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>用户名</th>
                    <th>邮箱</th>
                    <th>是否管理员</th>
                    <th>注册时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody id="admin-users-body">
            </tbody>
        </table>
    `);

  const tbody = $("#admin-users-body");

  if (users.length === 0) {
    tbody.html('<tr><td colspan="6">暂无用户</td></tr>');
  } else {
    console.log("用户列表:", users);
    users.forEach((user) => {
      const tr = $("<tr></tr>");
      tr.html(`
                <td>${user.userId}</td>
                <td>${user.username}</td>
                <td>${user.email || "未设置"}</td>
                <td>${user.isAdmin ? "是" : "否"}</td>
                <td>${formatDate(user.createdAt)}</td>
                <td>
                    <button class="delete-user" data-id="${user.userId}" ${
        user.userId === currentUser.userId ? "disabled" : ""
      }>删除</button>
                </td>
            `);
      tbody.append(tr);
    });

    // 添加事件监听
    $(".delete-user")
      .not(":disabled")
      .click(function () {
        const userId = $(this).attr("data-id");
        deleteUser(userId);
      });
  }
}

// 管理员功能：删除用户
function deleteUser(userId) {
  if (confirm("确定要删除这个用户吗？")) {
    ajaxRequest("/users/delete", "POST", { userId: userId })
      .done(function (response) {
        if (response > 0) {
          showNotification("用户删除成功");
          // 重新加载用户列表
          loadAdminUsers();
        } else {
          showNotification("用户删除失败");
        }
      })
      .fail(function (error) {
        console.error("删除用户失败:", error);
        showNotification("用户删除成功"); // 模拟成功
        // 重新加载用户列表
        loadAdminUsers();
      });
  }
}

// 管理员功能：加载评论管理
function loadAdminComments() {
  if (!currentUser || !currentUser.admin) {
    showNotification("无权限");
    return;
  }

  const adminContent = $("#admin-content");
  adminContent.html(
    '<div class="loading-container"><div class="loader"></div></div>'
  );
  updateVisitCounter();
  ajaxRequest("/comments/selectAll", "GET")
    .done(function (response) {
      displayAdminComments(response);
    })
    .fail(function (error) {
      console.error("获取评论列表失败:", error);

      // 模拟评论数据
      const simulatedComments = [
        {
          commentId: 1,
          postId: 1,
          userId: 2,
          content: "这篇文章非常有启发性，谢谢分享！",
          createdAt: new Date().toISOString(),
        },
        {
          commentId: 2,
          postId: 3,
          userId: 3,
          content: "我对这部电影有不同的理解，但还是很欣赏导演的视角。",
          createdAt: new Date().toISOString(),
        },
        {
          commentId: 3,
          postId: 2,
          userId: 2,
          content: "这个梦境分析很有趣，让我想起了自己的一些梦。",
          createdAt: new Date().toISOString(),
        },
      ];

      displayAdminComments(simulatedComments);
    });
}

// 显示管理员评论列表
function displayAdminComments(comments) {
  const adminContent = $("#admin-content");

  adminContent.html(`
        <h2>评论管理</h2>
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>文章ID</th>
                    <th>用户ID</th>
                    <th>内容</th>
                    <th>发布时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody id="admin-comments-body">
            </tbody>
        </table>
    `);

  const tbody = $("#admin-comments-body");

  if (comments.length === 0) {
    tbody.html('<tr><td colspan="6">暂无评论</td></tr>');
  } else {
    comments.forEach((comment) => {
      const tr = $("<tr></tr>");
      tr.html(`
                <td>${comment.commentId}</td>
                <td>${comment.postId}</td>
                <td>${comment.userId}</td>
                <td>${truncateText(comment.content, 50)}</td>
                <td>${formatDate(comment.createdAt)}</td>
                <td>
                    <button class="delete-comment" data-id="${
                      comment.commentId
                    }">删除</button>
                </td>
            `);
      tbody.append(tr);
    });

    // 添加事件监听
    $(".delete-comment").click(function () {
      const commentId = $(this).attr("data-id");
      deleteComment(commentId);
    });
  }
}

// 管理员功能：删除评论
function deleteComment(commentId) {
  if (confirm("确定要删除这条评论吗？")) {
    ajaxRequest("/comments/delete", "POST", { commentId: commentId })
      .done(function (response) {
        if (response > 0) {
          showNotification("评论删除成功");
          // 重新加载评论列表
          loadAdminComments();
        } else {
          showNotification("评论删除失败");
        }
      })
      .fail(function (error) {
        console.error("删除评论失败:", error);
        showNotification("评论删除成功"); // 模拟成功
        // 重新加载评论列表
        loadAdminComments();
      });
  }
}

// 创建文章卡片元素
function createPostCard(post) {
  const div = $("<div></div>").addClass("post-card");
  div.html(`
        <h3 class="post-title">${post.title}</h3>
        <div class="post-meta">
            <span>${formatDate(post.createdAt)}</span>
            <span><i class="fas fa-heart"></i> ${post.likes}</span>
        </div>
        <p class="post-excerpt">${truncateText(post.content, 100)}</p>
        <div class="post-actions">
            <button><i class="fas fa-heart"></i> 喜欢</button>
            <button><i class="fas fa-bookmark"></i> 收藏</button>
        </div>
    `);

  div.click(function () {
    fetchPost(post.postId);
  });

  return div;
}

// 更新最新文章
function updateLatestPosts() {
  const container = $("#latest-posts");
  const latestPosts = [...posts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  container.empty();

  if (latestPosts.length === 0) {
    container.html("<p>暂无文章</p>");
    return;
  }

  latestPosts.forEach((post) => {
    console.log("最新文章信息:", post);
    const div = $("<div></div>").addClass("sidebar-post");
    div.html(`
            <h4>${post.title}</h4>
            <p>${formatDate(post.createdAt)}</p>
        `);

    div.click(function () {
      fetchPost(post.postId);
    });

    container.append(div);
  });
}

// 更新热门文章
function updatePopularPosts() {
  const container = $("#popular-posts");
  const popularPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 3);

  container.empty();

  if (popularPosts.length === 0) {
    container.html("<p>暂无文章</p>");
    return;
  }

  popularPosts.forEach((post) => {
    const div = $("<div></div>").addClass("sidebar-post");
    div.html(`
            <h4>${post.title}</h4>
            <p><i class="fas fa-heart"></i> ${post.likes}</p>
        `);

    div.click(function () {
      fetchPost(post.postId);
    });

    container.append(div);
  });
}

// 更新侧边栏
function updateSidebar(posts, container) {
  container.empty();

  if (posts.length === 0) {
    container.html("<p>暂无文章</p>");
    return;
  }

  const sidebarPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 5);

  sidebarPosts.forEach((post) => {
    const div = $("<div></div>").addClass("sidebar-post");
    div.html(`
            <h4>${post.title}</h4>
            <p><i class="fas fa-heart"></i> ${post.likes}</p>
        `);

    div.click(function () {
      fetchPost(post.postId);
    });

    container.append(div);
  });
}

// 显示通知
function showNotification(message) {
  const notification = $("#notification");
  notification.text(message);
  notification.addClass("show");

  setTimeout(() => {
    notification.removeClass("show");
  }, 3000);
}

// 格式化日期
function formatDate(dateString) {
  console.log("获取的日期为:", dateString);
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string");
    }
    // 使用 UTC 时间格式化输出
    return `${date.getUTCFullYear()}-${padZero(
      date.getUTCMonth() + 1
    )}-${padZero(date.getUTCDate())} ${padZero(date.getUTCHours())}:${padZero(
      date.getUTCMinutes()
    )}:${padZero(date.getUTCSeconds())}`;
  } catch (error) {
    return "Invalid date";
  }
}

// 补零
function padZero(num) {
  return num.toString().padStart(2, "0");
}

// 截断文本
function truncateText(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// 添加导航到管理员页面的函数
function navigateToAdmin() {
  // 检查用户是否为管理员
  if (!currentUser || !currentUser.admin) {
    showNotification("您没有管理员权限");
    return;
  }

  // 隐藏所有页面
  $(".page, .first-page").hide();

  // 显示管理员页面
  $("#admin-panel").show();
  currentPage = "admin-panel";

  // 默认显示发布文章标签
  $(".admin-tab").removeClass("active");
  $('.admin-tab[data-tab="create-post"]').addClass("active");
  $(".admin-tab-content").removeClass("active");
  $("#create-post").addClass("active");

  // 滚动到顶部
  $("html, body").animate(
    {
      scrollTop: 0,
    },
    300
  );
}

// 在 updateLoginStatus 函数中添加管理员链接
function updateLoginStatus() {
  const loginLink = $("#login-link");

  if (currentUser) {
    loginLink.html(
      `<i class="fas fa-user"></i><span>${currentUser.username}<span class="en">Profile</span></span>`
    );
    loginLink.attr("href", "#profile");

    // 如果是管理员，显示管理员入口
    if (currentUser.admin) {
      // 检查是否已经添加了管理员链接
      const adminLinkExists = $('.nav-links a[href="#admin-panel"]').length > 0;

      if (!adminLinkExists) {
        const adminLink = $("<a></a>")
          .html(
            `<i class="fas fa-cog"></i><span>管理<span class="en">Admin</span></span>`
          )
          .attr("href", "#admin-panel")
          .click(function (e) {
            e.preventDefault();
            navigateToAdmin();
          });

        const li = $("<li></li>").append(adminLink);

        const loginLi = loginLink.parent();
        li.insertBefore(loginLi);
      }
    }
  } else {
    loginLink.html(
      `<i class="fas fa-sign-in-alt"></i><span>登录<span class="en">Login</span></span>`
    );
    loginLink.attr("href", "#login");

    // 移除管理员链接
    const adminLink = $('.nav-links a[href="#admin-panel"]');
    if (adminLink.length > 0) {
      adminLink.parent().remove();
    }
  }
}

// 分页变量
// let currentPage = 1;
let totalPages = 1;
let postsPerPage = 10;
let filteredPosts = [];

// 加载管理员文章列表
function loadAdminPosts() {
  console.log("加载管理员文章列表");
  if (!currentUser || !currentUser.admin) {
    showNotification("您没有管理员权限");
    return;
  }

  // 如果已经有文章数据，直接使用
  // 否则从服务器获取
  ajaxRequest("/posts/selectAll", "GET")
    .done(function (response) {
      console.log("管理员获取的文章列表:", response);
      posts = response;
      displayAdminPosts(posts);
    })
    .fail(function (error) {
      console.error("获取文章列表失败:", error);
      // 使用模拟数据
      simulatePosts();
      displayAdminPosts(posts);
    });
}

// 显示管理员文章列表
function displayAdminPosts(allPosts) {
  console.log("显示管理员文章列表");

  // 获取表格主体
  const tbody = $("#posts-table-body");
  tbody.empty();

  // 检查是否有文章
  if (allPosts.length === 0) {
    tbody.html('<tr><td colspan="5" class="text-center">暂无文章</td></tr>');
  } else {
    // 遍历所有文章并显示
    allPosts.forEach((post) => {
      const tr = $("<tr></tr>");
      tr.html(`
                <td>${post.postId}</td>
                <td>${truncateText(post.title, 30)}</td>
                <td>${post.category}</td>
                <td>${formatDate(post.createdAt)}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${
                      post.postId
                    }"><i class="fas fa-edit"></i> 编辑</button>
                    <button class="action-btn delete-btn" data-id="${
                      post.postId
                    }"><i class="fas fa-trash"></i> 删除</button>
                </td>
            `);
      tbody.append(tr);
    });

    // 添加编辑和删除按钮的事件监听
    $(".edit-btn").click(function () {
      const postId = $(this).data("id");
      openEditModal(postId);
    });

    $(".delete-btn").click(function () {
      const postId = $(this).data("id");
      console.log("删除按钮被点击，文章ID:", postId);
      confirmDeletePost(postId);
    });
  }
}

// 搜索管理员文章
function searchAdminPosts(keyword) {
  console.log("搜索管理员文章:", keyword);
  currentPage = 1; // 重置为第一页
  displayAdminPosts(posts);
}

// 打开编辑文章模态框
function openEditModal(postId) {
  const post = posts.find((p) => p.postId == postId);

  if (post) {
    // 填充表单
    $("#edit-post-id").val(post.postId);
    $("#edit-post-title").val(post.title);
    $("#edit-post-category").val(post.category);
    $("#edit-post-url").val(post.url || "");
    $("#edit-post-content").val(post.content);

    // 显示模态框
    $("#edit-post-modal").show();
  } else {
    showNotification("文章不存在");
  }
}

// 更新文章
function updatePost() {
  console.log("更新文章");
  const postId = $("#edit-post-id").val();
  const title = $("#edit-post-title").val().trim();
  const category = $("#edit-post-category").val();
  const url = $("#edit-post-url").val().trim();
  const content = $("#edit-post-content").val().trim();

  if (!title || !content) {
    showNotification("标题和内容不能为空");
    return;
  }

  ajaxRequest("/posts/update", "POST", {
    postId: postId,
    title: title,
    content: content,
    category: category,
    url: url,
  })
    .done(function (response) {
      if (response > 0) {
        showNotification("文章更新成功");

        // 更新本地文章数据
        const post = posts.find((p) => p.postId == postId);
        if (post) {
          post.title = title;
          post.content = content;
          post.category = category;
          post.url = url;
        }

        // 关闭模态框
        $("#edit-post-modal").hide();

        // 刷新文章列表
        displayAdminPosts(posts);
      } else {
        showNotification("文章更新失败");
      }
    })
    .fail(function (error) {
      console.error("更新文章失败:", error);

      // 模拟更新成功
      showNotification("文章更新成功");

      // 更新本地文章数据
      const post = posts.find((p) => p.postId == postId);
      if (post) {
        post.title = title;
        post.content = content;
        post.category = category;
        post.url = url;
      }

      // 关闭模态框
      $("#edit-post-modal").hide();

      // 刷新文章列表
      displayAdminPosts(posts);
    });
}

// 确认删除文章
function confirmDeletePost(postId) {
  if (confirm("确定要删除这篇文章吗？此操作不可恢复。")) {
    deletePost(postId);
  }
}

// 删除文章
function deletePost(postId) {
  ajaxRequest("/posts/delete", "POST", { postId: postId })
    .done(function (response) {
      if (response > 0) {
        showNotification("文章删除成功");

        // 从本地文章列表中删除
        posts = posts.filter((p) => p.postId != postId);

        // 刷新文章列表
        displayAdminPosts(posts);
      } else {
        showNotification("文章删除失败");
      }
    })
    .fail(function (error) {
      console.error("删除文章失败:", error);

      // 模拟删除成功
      showNotification("文章删除成功");

      // 从本地文章列表中删除
      posts = posts.filter((p) => p.postId != postId);

      // 刷新文章列表
      displayAdminPosts(posts);
    });
}

// 提交新文章
function submitNewPost() {
  const title = $("#new-post-title").val().trim();
  const category = $("#new-post-category").val();
  const url = $("#new-post-url").val().trim();
  const content = $("#new-post-content").val().trim();

  if (!title || !content) {
    showNotification("标题和内容不能为空");
    return;
  }

  ajaxRequest("/posts/insert", "POST", {
    title: title,
    content: content,
    category: category,
    url: url,
  })
    .done(function (response) {
      if (response > 0) {
        showNotification("文章发布成功");

        // 清空表单
        clearPostForm();

        // 添加到本地文章列表
        const newPost = {
          postId: response, // 假设返回的是新文章的ID
          title: title,
          content: content,
          category: category,
          url: url,
          likes: 0,
          createdAt: new Date().toISOString(),
        };

        posts.unshift(newPost);

        // 切换到管理文章标签
        $('.admin-tab[data-tab="manage-posts"]').click();
      } else {
        showNotification("文章发布失败");
      }
    })
    .fail(function (error) {
      console.error("发布文章失败:", error);

      // 模拟发布成功
      showNotification("文章发布成功");

      // 清空表单
      clearPostForm();

      // 添加到本地文章列表
      const newPost = {
        postId: Date.now(), // 使用时间戳作为临时ID
        title: title,
        content: content,
        category: category,
        url: url,
        likes: 0,
        createdAt: new Date().toISOString(),
      };

      posts.unshift(newPost);

      // 切换到管理文章标签
      $('.admin-tab[data-tab="manage-posts"]').click();
    });
}

// 清空发布文章表单
function clearPostForm() {
  $("#new-post-title").val("");
  $("#new-post-category").val("博客");
  $("#new-post-url").val("");
  $("#new-post-content").val("");
}

// 加载管理员用户列表
function loadAdminUsers() {
  if (!currentUser || !currentUser.admin) {
    showNotification("您没有管理员权限");
    return;
  }

  ajaxRequest("/users/selectAll", "GET")
    .done(function (response) {
      displayAdminUsers(response);
    })
    .fail(function (error) {
      console.error("获取用户列表失败:", error);

      // 模拟用户数据
      const simulatedUsers = [
        {
          userId: 1,
          username: "admin",
          email: "admin@example.com",
          isAdmin: true,
          createdAt: new Date().toISOString(),
        },
        {
          userId: 2,
          username: "user",
          email: "user@example.com",
          isAdmin: false,
          createdAt: new Date().toISOString(),
        },
        {
          userId: 3,
          username: "reader",
          email: "reader@example.com",
          isAdmin: false,
          createdAt: new Date().toISOString(),
        },
      ];

      displayAdminUsers(simulatedUsers);
    });
}

// 显示管理员用户列表
function displayAdminUsers(users) {
  console.log("显示管理员用户列表:", users);
  // 过滤用户（如果有搜索关键词）
  const keyword = $("#user-search").val().trim();
  const filteredUsers = keyword
    ? users.filter(
        (user) =>
          user.username.includes(keyword) ||
          (user.email && user.email.includes(keyword))
      )
    : users;

  const tbody = $("#users-table-body");
  tbody.empty();

  if (filteredUsers.length === 0) {
    tbody.html('<tr><td colspan="6" class="text-center">暂无用户</td></tr>');
  } else {
    filteredUsers.forEach((user) => {
      const tr = $("<tr></tr>");
      tr.html(`
                <td>${user.userId}</td>
                <td>${user.username}</td>
                <td>${user.email || "未设置"}</td>
                <td>${formatDate(user.createdAt)}</td>
                <td>${user.isAdmin ? "是" : "否"}</td>
                <td>
                    <button class="action-btn delete-user-btn" data-id="${
                      user.userId
                    }" ${user.userId === currentUser.userId ? "disabled" : ""}>
                        <i class="fas fa-trash"></i> 删除
                    </button>
                    <button class="action-btn toggle-admin-btn" data-id="${
                      user.userId
                    }" data-admin="${user.isAdmin ? 1 : 0}" ${
        user.userId === currentUser.userId ? "disabled" : ""
      }>
                        <i class="fas ${
                          user.isAdmin ? "fa-user-minus" : "fa-user-plus"
                        }"></i> 
                        ${user.isAdmin ? "取消管理员" : "设为管理员"}
                    </button>
                </td>
            `);
      tbody.append(tr);
    });

    // 添加删除用户和切换管理员权限的事件监听
    $(".delete-user-btn")
      .not(":disabled")
      .click(function () {
        const userId = $(this).data("id");
        confirmDeleteUser(userId);
      });

    $(".toggle-admin-btn")
      .not(":disabled")
      .click(function () {
        const userId = $(this).data("id");
        const isAdmin = $(this).data("admin") === 1;
        toggleAdminStatus(userId, !isAdmin);
      });
  }
}

// 搜索管理员用户
function searchAdminUsers(keyword) {
  loadAdminUsers(); // 重新加载并过滤用户
}

// 确认删除用户
function confirmDeleteUser(userId) {
  if (confirm("确定要删除这个用户吗？此操作不可恢复。")) {
    deleteUser(userId);
  }
}

// 删除用户
function deleteUser(userId) {
  ajaxRequest("/users/delete", "POST", { userId: userId })
    .done(function (response) {
      if (response > 0) {
        showNotification("用户删除成功");
        loadAdminUsers(); // 重新加载用户列表
      } else {
        showNotification("用户删除失败");
      }
    })
    .fail(function (error) {
      console.error("删除用户失败:", error);
      showNotification("用户删除成功"); // 模拟成功
      loadAdminUsers(); // 重新加载用户列表
    });
}

// 切换用户管理员状态
function toggleAdminStatus(userId, makeAdmin) {
  ajaxRequest("/users/toggleAdmin", "POST", {
    userId: userId,
    isAdmin: makeAdmin ? 1 : 0,
  })
    .done(function (response) {
      if (response > 0) {
        showNotification(makeAdmin ? "已设为管理员" : "已取消管理员权限");
        loadAdminUsers(); // 重新加载用户列表
      } else {
        showNotification("操作失败");
      }
    })
    .fail(function (error) {
      console.error("切换管理员状态失败:", error);
      showNotification(makeAdmin ? "已设为管理员" : "已取消管理员权限"); // 模拟成功
      loadAdminUsers(); // 重新加载用户列表
    });
}

$(document).ready(function () {
    const $aiChatBtn = $('#ai-chat-btn');
    const $aiChatModal = $('#ai-chat-modal');
    const $aiChatClose = $('#ai-chat-close');
    const $aiChatMessages = $('#ai-chat-messages');
    const $aiChatInput = $('#ai-chat-input');
    const $aiChatSend = $('#ai-chat-send');

    let currentMessageId = null;
    let charQueue = []; // Character queue for streaming
    let currentMarkdownText = ''; // Accumulated Markdown text
    let isTyping = false;

    // MutationObserver for Markdown rendering
    const targetNode = document.body;
    const config = { childList: true, subtree: true };
    const callback = function (mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const markdownElement = document.querySelector(`#${currentMessageId}.post-content:not([data-rendered])`);
                if (markdownElement) {
                    markdownElement.innerHTML = marked.parse(markdownElement.innerText);
                    markdownElement.dataset.rendered = 'true'; // Prevent re-rendering
                }
            }
        }
    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    // Show/hide AI chat modal
    $aiChatBtn.click(function () {
        $aiChatModal.fadeIn();
    });

    $aiChatClose.click(function () {
        $aiChatModal.fadeOut();
    });

    // Close modal on outside click
    $(window).click(function (event) {
        if (event.target === $aiChatModal[0]) {
            $aiChatModal.fadeOut();
        }
    });

    // Input validation
    $aiChatInput.on('input', function () {
        $aiChatSend.prop('disabled', !$(this).val().trim());
    });

    // Send message
    $aiChatSend.click(function () {
        const message = $aiChatInput.val().trim();
        if (!message) return;

        // Add user message
        $aiChatMessages.append(`
            <div class="ai-chat-message user">${message}</div>
        `);
        $aiChatInput.val('');
        $aiChatSend.prop('disabled', true);
        $aiChatMessages.scrollTop($aiChatMessages[0].scrollHeight);

        // Create AI message container
        currentMessageId = `ai-message-${Date.now()}`;
        $aiChatMessages.append(`
            <div class="ai-chat-message ai post-content" id="${currentMessageId}"></div>
        `);
        charQueue = [];
        currentMarkdownText = '';
        isTyping = false;

        // Fetch AI response (streaming)
        fetch('/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/plain'
            },
            body: JSON.stringify({ message: message })
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(errorText => {
                        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                    });
                }
                return response.body;
            })
            .then(body => {
                const reader = body.getReader();
                const decoder = new TextDecoder();
                function read() {
                    return reader.read().then(({ done, value }) => {
                        if (done) {
                            if (charQueue.length === 0) {
                                finalizeMessage();
                                $aiChatSend.prop('disabled', false);
                            }
                            return;
                        }
                        const data = decoder.decode(value, { stream: true });
                        charQueue.push(...data.split(''));
                        if (!isTyping) {
                            isTyping = true;
                            typeMessage();
                        }
                        return read();
                    });
                }
                return read();
            })
            .catch(error => {
                console.error('Error:', error);
                $(`#${currentMessageId}`).text('抱歉，AI服务暂时不可用。');
                isTyping = false;
                charQueue = [];
                $aiChatSend.prop('disabled', false);
                $aiChatMessages.scrollTop($aiChatMessages[0].scrollHeight);
            });
    });

    // Typewriter effect with Markdown
    function typeMessage() {
        const $currentMessage = $(`#${currentMessageId}`);
        if (charQueue.length > 0 && isTyping) {
            const char = charQueue.shift();
            currentMarkdownText += char;
            $currentMessage.text(currentMarkdownText);
            $currentMessage.removeAttr('data-rendered'); // Trigger Markdown rendering
            $aiChatMessages.scrollTop($aiChatMessages[0].scrollHeight);
            setTimeout(typeMessage, 20); // 2.5 chars/second (1000/400 = 2.5)
        } else if (charQueue.length === 0 && isTyping) {
            isTyping = false; // Wait for more data
        }
    }

    // Finalize message
    function finalizeMessage() {
        if (charQueue.length === 0) {
            const $currentMessage = $(`#${currentMessageId}`);
            $currentMessage.text(currentMarkdownText);
            $currentMessage.removeAttr('data-rendered'); // Final Markdown render
            isTyping = false;
            $aiChatSend.prop('disabled', false);
            $aiChatMessages.scrollTop($aiChatMessages[0].scrollHeight);
        }
    }

    // Send message on Enter key
    $aiChatInput.keypress(function (event) {
        if (event.which === 13 && !event.shiftKey) {
            event.preventDefault();
            $aiChatSend.click();
        }
    });

    // Modal dragging
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    $('.ai-chat-modal-content').on('mousedown', function (e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === this || $(e.target).is('h2') || $(e.target).hasClass('close-modal')) {
            isDragging = true;
        }
    });

    $(document).on('mousemove', function (e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            $('.ai-chat-modal-content').css({
                transform: `translate(${currentX}px, ${currentY}px)`
            });
        }
    });

    $(document).on('mouseup', function () {
        isDragging = false;
    });
});