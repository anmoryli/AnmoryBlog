drop table if exists history;
drop table if exists comments;
drop table if exists posts;
drop table if exists users;
create table users (
    user_id int primary key auto_increment,
    username varchar(255) not null,
    password varchar(255) not null,
    is_admin boolean not null default false,
    email varchar(255),
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp
);

create table posts (
    post_id int primary key auto_increment,
    title varchar(255) not null,
    content longtext,
    category varchar(255) not null,
    url varchar(255) not null,
    likes int default 0,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp
);

create table comments (
    comment_id int primary key auto_increment,
    post_id int not null,
    user_id int not null,
    content longtext,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    foreign key (post_id) references posts (post_id),
    foreign key (user_id) references users (user_id)
);

create table history (
    history_id int primary key auto_increment,
    user_id int not null, -- 如果是1代表是AI发送的
    content longtext,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    foreign key (user_id) references users (user_id)
);