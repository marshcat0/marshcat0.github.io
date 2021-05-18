# blog

## 关于远端

`master`分支为github自动构建用，在`source`分支写博文，写完一篇新的博客后，将代码推送到远端，github就会自动构建静态页面。

## 关于插入图片

如`bigSur-hidpi`这篇文章，`![mount](./mount.png)`插入图片即可。图片其实放置在`source/posts/bigSur-hidpi`下面，vscode-hexo-util插件将`./`映射到了`/bigSur-hidpi`。而在构建后的文件中，这篇博文的html与图片文件是在一个目录下的。

# 关于写作

## 关于vercel

由于`github pages`在境内的访问实在是一言难尽，因此使用了`vercel`，会快一点。评论插件`waline`也使用了`vercel`。

[参考地址](https://www.iaia.cc/posts/2418998582.html)
