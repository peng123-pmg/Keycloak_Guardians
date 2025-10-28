# Keycloak定制化项目 - Keycloak Guardians

## 项目目标
在4周内，完成一个包含自定义登录界面、自定义管理界面和自定义账户界面的企业级Keycloak解决方案，并产出完整的前后端接入文档与最佳实践。

## 团队阵容与角色
- 产品经理 (PM): 李诗嘉
- 前端开发 (FE): 李欣冉， 彭茂钢
- 后端开发 (BE): 李政达， 周承锦
- UI设计师 (UI): 王梓萱
- 测试工程师 (QA): 陈艺

## 环境准备 (第一要务)
截止时间：本周内，所有人必须完成。

1.  安装Git
    - 下载链接：https://git-scm.com/download/win
    - 验证安装：打开终端（命令提示符CMD、PowerShell或Git Bash），输入以下命令，若显示版本号则成功：
      bash
      git --version

安装成功如下图所示：
![git验证](https://github.com/fionamoore/Keycloak_Guardians/blob/main/media/git%E9%AA%8C%E8%AF%81.png)

2.  安装Docker
    - 下载链接：https://www.docker.com/products/docker-desktop/
    - 验证安装：安装并启动Docker Desktop后，在终端输入：
      bash
      docker --version
   按需下载：
![docker安装](https://github.com/fionamoore/Keycloak_Guardians/blob/main/media/docker%E5%AE%89%E8%A3%85.png)
点击软件进入：
![指令复制](https://github.com/fionamoore/Keycloak_Guardians/blob/main/media/docker%E6%8C%87%E4%BB%A4%E5%A4%8D%E5%88%B6.png)
copy指令：wsl --update
在键盘上按 Win + S 键，输入 cmd。
在搜索结果“命令提示符”上，右键单击，选择 “以管理员身份运行”。
在打开的黑色窗口中，右键单击，将复制的 wsl --update 命令粘贴进去，然后按回车键。
![wsl更新](https://github.com/fionamoore/Keycloak_Guardians/blob/main/media/wsl%E6%9B%B4%E6%96%B0%E8%BF%87%E7%A8%8B.png)
WSL更新完成后，可以点击弹窗中的 Restart 按钮，或者手动重启。
![restart后](https://github.com/fionamoore/Keycloak_Guardians/blob/main/media/restart.png)
打开命令行：
按 Win + R 键，输入 cmd，然后按回车，打开命令提示符。
验证Docker命令：
在命令行中输入以下命令并回车：
bash
docker --version
![docker安装验证](https://github.com/fionamoore/Keycloak_Guardians/blob/main/media/docker%E5%AE%89%E8%A3%85%E9%AA%8C%E8%AF%81.png)
使用 cd 命令进入你之前克隆的项目目录 Keycloak_Guardians。
bash
cd [你的路径]\Keycloak_Guardians
执行启动命令：
bash
docker-compose up -d
访问 http://localhost:8080，使用 admin/admin 登录。
如果找不到文件可以直接克隆（示例）：
git clone https://github.com/fionamoore/Keycloak_Guardians.git "D:\myFiles\Keycloak"
接着输入指令：
D:\myFiles\Keycloak> 
Dir
![目录显示](https://github.com/fionamoore/Keycloak_Guardians/blob/main/media/%E7%9B%AE%E5%BD%95.png)
如果像图中一样没有docker-compose.yml文件，在D:\myFiles\Keycloak 文件夹中，右键新建一个文本文档。
将文件重命名为 docker-compose.yml（注意扩展名是 .yml 不是 .txt）。
![yml文件创建](https://github.com/fionamoore/Keycloak_Guardians/blob/main/media/%E6%8F%90%E4%BA%A4%E6%88%AA%E5%9B%BE1.png)
用VS Code打开这个文件，复制粘贴以下内容：
version: '3.8'services:
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    ports:
      - "8080:8080"
    command: start-dev
并保存文件。
![keycloak环境搭建完成](https://github.com/fionamoore/Keycloak_Guardians/blob/main/media/keycloak%E7%8E%AF%E5%A2%83%E6%90%AD%E5%BB%BA.png)

本地 Keycloak 环境搭建指南已打通。
请所有人按照步骤操作，目标是在2025年10月29日前访问 http://localhost:8080 并成功登录管理后台（账号admin/admin）并截图发给李诗嘉同学。
示例如下：
![提交截图1](https://github.com/fionamoore/Keycloak_Guardians/blob/main/media/%E6%8F%90%E4%BA%A4%E6%88%AA%E5%9B%BE2.png)
![提交截图2](https://github.com/fionamoore/Keycloak_Guardians/blob/main/media/%E6%8F%90%E4%BA%A4%E6%88%AA%E5%9B%BE2.png)

3.  前端同学额外安装Node.js
    - 下载链接：https://nodejs.org (选择 LTS 版本)
    - 验证安装：
      bash
      node --version
      npm --version
     ![提交截图3](https://github.com/fionamoore/Keycloak_Guardians/blob/main/media/%E6%8F%90%E4%BA%A4%E6%88%AA%E5%9B%BE3.png)


## 本周核心任务：环境搭建与认知统一 (Week 1)
目标：全体成员在本地成功运行Keycloak，并对OIDC流程建立基本认知。

## 任务一：启动Keycloak (全体成员)
1.  获取代码：在终端中执行以下命令，将本项目下载到本地。
    bash
    git clone https://github.com/fionamoore/Keycloak_Guardians.git
    cd Keycloak_Guardians
   
2.  启动服务：执行以下命令，启动Keycloak服务。
    bash
    docker-compose up -d
   
3.  验证：打开浏览器，访问 http://localhost:8080。
    - 成功标志：能看到Keycloak页面，并使用 用户名: admin， 密码: admin 成功登录管理后台。
    - 输出物：提交登录成功后的截图给李诗嘉同学。

## 任务二：技术学习与分工
- 前端 (李欣冉， 彭茂钢):
  - 任务：研究 keycloakify 官方示例。
  - 目标：在本地运行一个 keycloakify 的React起步模板，理解项目结构。
  - 资源：https://github.com/keycloakify/keycloakify

- 后端 (李政达， 周承锦):
  - 任务：研究Spring Boot如何集成Keycloak。
  - 目标：找到一个Spring Boot集成Keycloak的Demo项目，并在本地运行起来。
  - 资源：https://www.baeldung.com/spring-boot-keycloak

- UI (王梓萱):
  - 任务：访问本地Keycloak登录页，了解默认UI布局和元素。
  - 目标：输出自定义登录界面的风格设计初稿。

- 测试 (陈艺):
  - 任务：学习OIDC基础流程。
  - 目标：输出一份《Keycloak环境搭建验收Checklist》。

## 项目资源
- 项目周会：每周六下午 19:00
- 代码仓库：https://github.com/fionamoore/Keycloak_Guardians
- 关键文档：
  - [Keycloak官方文档](https://www.keycloak.org/documentation)
  - [Keycloakify文档](https://docs.keycloakify.dev/)
  - [OIDC SPA 接入指南](https://www.oidc-spa.dev/)

以下工具可帮助团队成员提升效率，建议安装：
## 1. GitHub Desktop (图形化Git工具)
- 适用人群：不熟悉Git命令的前端、UI、测试同学。
- 作用：通过图形界面完成克隆、提交、分支管理等操作，降低学习成本。
- 下载链接：https://desktop.github.com/

## 2. Watt Toolkit (网络加速工具)
- 适用人群：所有在安装Docker或访问GitHub时遇到网络连接问题的成员。
- 作用：对GitHub、Docker等开发者常用网站进行网络加速。
- 下载链接：https://steampp.net/

  ps.过程中有问题及时反馈。
李诗嘉更新于2025年10月27日
