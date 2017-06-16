# 依赖
1.nodejs（v6,以上目前不支持）下载页面：https://nodejs.org/  
2.MariaDB \ MySQL 下载页面（MariaDB）：https://downloads.mariadb.org/  
3.redis 下载页面（windows版）：https://github.com/MSOpenTech/redis/releases

# 安装流程（windows）

1.解zip文件到需要的安装目录  
2.在安装目录下打开cmd或者powershell  
3.执行`npm install`  
4.连接MariaDB或者MySQL，在需要的数据库下执行安装目录下的createTables.sql文件  
5.修改config/LocalConfig.json文件

# 部署流程
推荐使用pm2做守护进程  

## 安装
在cmd下执行`npm isntall -g pm2`命令  

## 简明使用教程
- 打开服务器：在安装目录下执行`pm2 start index.js`
- 查询服务器状态：执行`pm2 list`
- 重启服务器：执行`pm2 restart [id]`。id可以通过`pm2 list`查询到（一般是0）
- 关闭服务器：执行`pm2 stop [id]`。id可以通过`pm2 list`查询到（一般是0）

更详细的使用方式请参阅：https://www.npmjs.com/package/pm2

## LocalConfig文件

基本配置项如下：

### paths：  

各类程序或文件存储路径配置。

- `mysql:`所使用的MariaDB\MySQl的mysqldump.exe的所在位置（在mariaDB\MySQL安装目录下的bin文件夹中）
- `photo:`上传的证件照的存放路径（绝对路径）
- `dump:`数据库备份文件的存放路径（绝对路径）


### db_config

MySQL连接参数配置。  
本系统采用mysql模块连接数据库。  
https://www.npmjs.com/package/mysql

基本配置项：
- `host:` 数据库连接地址。数据库在本地即为`"127.0.0.1"`
- `port:` 数据库连接端口。默认为3306
- `user:` 用户名
- `password:` 密码
- `database:` 数据库名

### table_names

各表的名称，请勿手动修改。

### redis_config

redis连接参数配置。  
本系统采用redis模块连接redis数据库。  
https://www.npmjs.com/package/redis

基本配置项：    
- `host:`redis连接地址。数据库在本地即为`"127.0.0.1"`。
- `port:`redis连接端口。默认为6379。  
- `ttl:` redis中的键值对默认的存活时间。（即后台临时登录的超时时间）

### stmpConfig

邮件发送器的配置。  
本系统使用nodemailer发送邮件  
具体配置项详见：https://nodemailer.com/smtp/

### domainName

对外使用的域名

### Port_frontStage

前台报名系统监听的端口（可以和后台系统监听同一个端口）

### Port_backStage

后台管理系统监听的端口（可以和前台系统监听同一个端口）

