# csl.cloud.back
 
## 数据库
---

### MySQL
---
[安装教程](https://dev.mysql.com/doc/refman/8.0/en/macos-installation.html)

启动后：

```bazaar
# 1. 先执行这句
mysql -u root -p

# 2.
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY [你的密码];
# 3.
FLUSH PRIVILEGES;
```

### MongoDB
---

[下载地址](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x-tarball/)

将解压后的文件夹拷贝到`/usr/local`

```bazaar
sudo cp -R [文件夹地址] /usr/local
```

创建在 `/usr/local` 创建 `var/mongodb` 目录，作为 `dbpath` 路径

启动 `mongodb` 服务，先不用 `auth` 启动

```bazaar
sudo [mongodb路径]/bin/mongod --dbpath /usr/local/var/mongodb
// fast start
sudo ./mongod --dbpath /usr/local/var/mongodb
```

[安装客户端](https://www.mongodb.com/try/download/compass)

连接本地 `mongodb` 服务，执行以下命令：

```bazaar
use admin
```

创建 `root` 用户：

```bazaar
db.createUser({
    user: 'root',
    pwd: '[你的密码]',
    roles: [{ role: 'root', db: 'root' }]
})
```

测试一下权限：

```bazaar
show dbs
show users
```

重新启动 `mongodb` 服务

```bazaar
[mongodb路径]/bin/mongod --depath /usr/local/var/mongodb --auth
```

关闭之前的连接，重新用客户端建立连接：`mongodb://root:[root用户密码]@localhost:27017/`

```bazaar
use admin

// 登录root账号
use.auth('root', [root密码])
// 创建数据库
use cloud
// 查看数据库是否创建成功
show dbs
// 创建 cloud 数据库的用户
db.create({
  user: 'caisanli',
  pwd: [你的密码],
  roles: [{ role: 'readWrite', db: 'cloud' }]
})
// 切换数据库
use cloud
// 登录用户
db.auth('caisanli', [你的密码])
```
可以在客户端新创建一个连接：`mongodb://caisanli:[你的密码]@localhost:27017/`
