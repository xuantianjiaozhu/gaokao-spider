# gaokao

gaokao.cn 的爬虫，最终会得到四张表，src/log 存放日志。使用 NestJS 作为后端框架，TypeORM 进行数据库操作。因为 JS 和 TS
不太熟，有些地方写的不是很好，例如一些数据的硬编码而不是配置文件，日志也是硬编码了而不是像 Slf4j 那样。

使用 Puppeteer 进行爬虫，Node 的 Worker Threads 来多线程操作。但是我对这两个都不是很熟悉，没想到一个传递 Puppeteer 的
browser 对象给工作线程的好方法，所以会打开很多个 Chrome，而不是只打开一个 Chrome、打开很多 page，这样的 CPU 和内存使用会很高。
