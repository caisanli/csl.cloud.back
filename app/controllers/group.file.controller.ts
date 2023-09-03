import {
  Body,
  BodyParam, Ctx, Delete,
  Get,
  JsonController, OnUndefined,
  Param,
  Post, Put,
  QueryParam, Req,
  UploadedFile,
  UseBefore
} from 'routing-controllers';
import { UserAuthMiddleware } from '../middlewares/userAuth';
import { FileChunkService, GroupFileService, GroupFolderService, GroupService } from '../services';
import { CATEGORY, ORDER } from '../types';
import { GroupFile, GroupFolder } from '../entities/mysql';
import {
  copyFile,
  fileUploadOptions,
  getCategory,
  getFileBuffer, getFileMime, getFileMimeType,
  getFileStat,
  mergeFile,
  removeFile, zip
} from '../helpers/upload';
import { FileChunkEntity } from '../entities/mongodb';
import { createFileHash, createUUID, twoDecimal } from '../helpers';
import { Context } from "vm";
import { Request } from 'koa';
/**
 * 团队文件接口管理
 */
@JsonController('/group/file')
@UseBefore(UserAuthMiddleware)
export class GroupFileController {
  private fileChunkService: FileChunkService;
  private groupFileService: GroupFileService;
  private groupFolderService: GroupFolderService;
  private groupService: GroupService;

  constructor() {
    this.fileChunkService = new FileChunkService();
    this.groupFileService = new GroupFileService();
    this.groupFolderService = new GroupFolderService();
    this.groupService = new GroupService();
  }

  /**
   * 获取团队文件
   * @param folderId
   * @param category
   * @param name
   * @param groupId 团队id
   * @param sort
   * @param page
   * @param num
   * @param order
   */
  @Get()
  async query(
    @QueryParam('folderId') folderId: string,
    @QueryParam('category') category: CATEGORY,
    @QueryParam('name') name: string,
    @QueryParam('groupId', {
      required: true
    }) groupId: string,
    @QueryParam('sort', {
      required: true,
      validate: true
    }) sort: string,
    @QueryParam('page', {
      required: true
    }) page: number,
    @QueryParam('num', {
      required: true
    }) num: number,
    @QueryParam('order', {
      required: true,
      validate: true
    }) order: ORDER
  ) {
    const [files, total] = await this.groupFileService.query(
        groupId, name, sort, order, page, num, folderId, category
    )
    let folders: GroupFolder[] = [];
    if (folderId) {
      const queryGroupId = folderId === '0' ? groupId : null;
      folders = await this.groupFolderService.getFoldersByGroupOrParentOrName(
          queryGroupId, folderId
      )
    }
    let crumbs: GroupFolder[] = [];
    if (folderId) {
      crumbs = await this.groupFolderService.getParents(folderId);
    }
    const result = {
      files,
      folders,
      crumbs,
      page: {
        count: Math.ceil(total / num),
        page,
        total
      }
    }
    return { message: '获取成功', data: result, code: 1 };
  }

  /**
   * 上传团队文件
   * @param file
   * @param bodyFile
   * @param folderId
   * @param groupId
   */
  @Post('/upload')
  async upload(
    @UploadedFile('file', {
      options: fileUploadOptions,
      required: true
    }) file: any,
    @Body({
      required: true
    }) bodyFile: FileChunkEntity,
    @BodyParam('folder', {
      required: true
    }) folderId: string,
    @BodyParam('group', {
      required: true
    }) groupId: string
  ) {
    // 校验文件夹
    if (folderId !== '0') {
      let folder = await this.groupFolderService.getById(folderId);
      if (!folder) {
        return { message: '文件夹不存在', code: 2 };
      }
    }
    // 校验团队信息
    const group = await this.groupService.getById(groupId);
    if (!group) {
      return { message: '团队不存在', code: 2 };
    }
    const data: {
      process: number,
      uploaded: boolean
    } = {
      process: 0,
      uploaded: false
    };
    // 获取一些文件信息
    const { name, size, modifyDate, chunk, chunks } = bodyFile;
    // 根据文件信息生成 hash 值
    const hashVal = createFileHash(name, size, modifyDate);

    // 检测分片文件是否传完
    if (chunk / 1 >= chunks / 1) { // 分片文件传完
      let newFileChunk = new FileChunkEntity();
      newFileChunk.id = hashVal;
      // 删除记录的切片文件
      this.fileChunkService.removeByCondition(newFileChunk);
      // 初始化文件
      let file = new GroupFile();
      let fileId: string = createUUID(name + Date.now());
      mergeFile(hashVal, fileId, name);
      file.id = fileId;
      file.name = name;
      file.size = size;
      file.modifyDate = new Date(modifyDate / 1);
      file.folderId = folderId;
      file.group = group;
      file.category = getCategory(name);
      file.thumbnail = '';
      // 创建文件
      await this.groupFileService.create(file);
      data.process = 1;
      data.uploaded = true;
    } else { // 分片未上传完成
      bodyFile.id = hashVal;
      bodyFile._id = hashVal;
      // 设置进度
      data.process = twoDecimal(chunk / chunks);
      // 记录切片文件进度
      await this.fileChunkService.create(bodyFile);
    }
    return { message: '上传成功', data: data, code: 1 }
  }

  /**
   *
   * 获取文件分片上传进度
   * @param {string} name
   * @param {number} size
   * @param {number} modifyDate
   * @returns
   * @memberof FileController
   */
  @Post('/chunk/process')
  async getChunkProcess(
    @BodyParam('name', {
      required: true
    }) name: string,
    @BodyParam('size', {
      required: true
    }) size: number,
    @BodyParam('modifyDate', {
      required: true
    }) modifyDate: number
  ) {
    const query = new FileChunkEntity();
    const hashVal = createFileHash(name, size, modifyDate);
    query._id = hashVal;
    query.id = hashVal;
    const chunkFiles = await this.fileChunkService.find(query);
    return { message: '获取成功', data: chunkFiles[0], code: 1 }
  }

  /**
   * 更新文件名称
   * @param id
   * @param name
   */
  @Put('/rename/:id')
  async rename(
    @Param('id') id: string,
    @BodyParam('name', {
      required: true
    }) name: string
  ) {
    const file = await this.groupFileService.getById(id);
    if (!file) {
      return { message: '文件不存在', code: 2 }
    }
    file.name = name;
    file.category = getCategory(name);
    await this.groupFileService.update(id, file);
    return { message: '更新成功', code: 1 };
  }

  /**
   * 批量删除文件或文件夹
   * @param fileIds
   * @param folderIds
   */
  @Delete('')
  async delete(
      @QueryParam('fileIds') fileIds: string,
      @QueryParam('folderIds') folderIds: string
  ) {
    const newFolderIds = folderIds?.split(',') || [];
    /**
     * 下面删除逻辑：只删除空文件夹，文件夹有内容的不删除
     */
    for (let i = 0; i < newFolderIds.length; i++) {
      const id = newFolderIds[i];
      if (!id) continue;
      const folder = await this.groupFolderService.getById(id)
      if (!folder) continue;
      const folderCount = await this.groupFolderService.getChildrenCount(id);
      if (folderCount > 0) continue;
      let fileCount = await this.groupFileService.getFileCount(id);
      if (fileCount > 0) continue;

      await this.groupFolderService.remove(id);
    }

    const newFileIds = fileIds?.split(',') || [];
    for (let i = 0; i < newFileIds.length; i++) {
      const id = newFileIds[i];
      if (!id) continue;
      const file = await this.groupFileService.getById(id);
      if (!file) continue;
      removeFile('./' + id);
      await this.groupFileService.remove(id);
    }
    return { message: '删除成功', code: 1 };
  }

  /**
   * 批量移动文件
   * @param ids
   * @param folderId
   * @param groupId
   */
  @Put('/move')
  async moveTo(
    @BodyParam('ids', {
     required: true
    }) ids: string,
    @BodyParam('folderId', {
     required: true
    }) folderId: string,
    @BodyParam('groupId', {
      required: true
    }) groupId: string
  ) {
    // 检验文件夹
    if (folderId === '0') {
      const folder = await this.groupFolderService.getById(folderId);
      if (folder) {
        return { message: '文件夹不存在', code: 2 }
      }
    }
    // 判断文件是否存在
    const idArr = ids.split(',');
    // 设定返回值
    const result = { notFound: [], already: [] };
    for (let i = 0; i < idArr.length; i++) {
      const id = idArr[i];
      if (!id) continue;
      const file = await this.groupFileService.getById(id);
      if (!file) {
        result.notFound.push(id);
        continue;
      }
      // 判断文件是否已存在目标目录
      const alreadyFile = new GroupFile();
      alreadyFile.folderId = folderId;
      alreadyFile.id = id;
      const files = await this.groupFileService.find(alreadyFile);
      if (files.length) {
        result.already.push(id);
        continue;
      }
      file.folderId = folderId;
      await this.groupFileService.update(id, file);
    }

    return { message: '移动成功', data: result, code: 1 };
  }

  /**
   * 拷贝文件
   * @param ids
   * @param folderId
   */
  async copy(
    @BodyParam('ids') ids: string,
    @BodyParam('folderId') folderId: string
  ) {
    // 校验文件夹是否存在
    if (folderId !== '0') {
      const folder = await this.groupFolderService.getById(folderId);
      if (!folder) {
        return { message: '文件夹不存在', code: 2 }
      }
      // 检验文件是否存在
      const idArr = ids.split(',');
      const result = { notFount: [], already: [] };
      for (let i = 0; i < idArr.length; i++) {
        const id = idArr[i];
        const file = await this.groupFileService.getById(id);
        if (!file) {
          result.notFount.push(file);
          continue;
        }
        // 判断文件是否已存在目标目录
        const alreadyFile = new GroupFile();
        alreadyFile.folderId = folderId;
        alreadyFile.id = id;
        const files = await this.groupFileService.find(alreadyFile);
        if (files.length) {
          result.already.push(id);
          continue;
        }
        const newId = createUUID(file.name);
        file.folderId = folderId;
        file.id = newId;
        copyFile('./' + id, './' + newId);
        await this.groupFileService.create(file);
      }
      return { message: '拷贝成功', data: result, code: 1 };
    }
  }

  /**
   * 获取文件信息
   * @param id
   */
  @Get('/:id')
  async getById(@Param('id') id: string) {
    const file = await this.groupFileService.getById(id);
    return { message: '获取成功', data: file, code: 1 }
  }

  /**
   * 预览文件
   * @param id
   * @param req
   * @param ctx
   */
  @Get('/preview/:id')
  @OnUndefined(206)
  async preview(
      @Param('id') id: string,
      @Req() req: Request,
      @Ctx() ctx: Context
  ) {
    try {
      const file = await this.groupFileService.getById(id);
      if (!file) {
        ctx.body = ctx.body = { message: '找不到文件', code: 2 };;
        return ;
      }
      const filePath = './' + id ;
      const stat = getFileStat(filePath);
      const range: string = req.headers.range;
      const type = getFileMime(file.name);
      if (!range) {
        const fileBuffer = await getFileBuffer(filePath, { start: 0, end: stat.size - 1 });
        ctx.type = type;
        ctx.body = fileBuffer;
      } else {
        const positions = range.replace(/bytes=/, '').split('-');
        const start = parseInt(positions[0], 10);
        const end = positions[1] ? parseInt(positions[1], 10) : stat.size - 1;
        const chunkSize = (end - start) + 1;
        const fileBuffer = await getFileBuffer(filePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': type
        }
        ctx.set(head);
        ctx.body = fileBuffer;
      }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 下载文件和文件夹
   * @memberof FileController
   * @param files
   * @param ctx
   */
  @Get('/folder/download')
  @OnUndefined(200)
  async download(
      @QueryParam('files') files: string,
      @Ctx() ctx: Context
  ) {
    try {
      const fileIds = files?.split(',') || [];
      if (!fileIds.length) {
        return { message: '请选择文件', code: 2 }
      }
      if (fileIds.length === 1) {
        const id = fileIds[0];
        const file = await this.groupFileService.getById(id);
        if (!file) {
          return { message: '找不到文件', code: 2 };
        }
        const filePath = './' + id ;
        const stat = getFileStat(filePath);
        const type = getFileMime(file.name);
        const fileBuffer = await getFileBuffer(filePath, { start: 0, end: stat.size - 1 });
        ctx.type = type;
        ctx.attachment(file.name);
        ctx.body = fileBuffer;
      } else {
        const files: GroupFile[] = [];
        for (let i = 0; i < fileIds.length; i++) {
          const id = fileIds[i];
          if (!id) return ;
          const file = await this.groupFileService.getById(id);
          if (file) files.push(file);
        }
        const zipBuffer = await zip(files);
        ctx.type = 'application/zip';
        ctx.attachment('附件.zip');
        ctx.body = zipBuffer;
      }
    } catch (error) {
      console.log(error);
    }
  }

  @Get('/chunk/:id')
  async getFileChunkById(@Param('id') id: string) {
    const query = new FileChunkEntity();
    query._id = id;
    query.id = id;
    const result = await this.fileChunkService.find(query);
    return { message: '查询成功', data: result, code: 1 }
  }

  @Delete('/chunk')
  async deleteFileChunkById() {
    let newFileChunk = new FileChunkEntity();
    newFileChunk.id = '421d0f38361a50d759ac0e9a0d87e2ba';
    await this.fileChunkService.removeByCondition(newFileChunk);
  }

  @Post('/type')
  async getFileType(@UploadedFile('file', {
    options: {
      dest: 'uploads/type/'
    },
    required: true
  }) file: any) {
    const result = await getFileMimeType('./type/' + file.filename)
    return { message: '获取成功', data: result, code: 1 }
  }
}
