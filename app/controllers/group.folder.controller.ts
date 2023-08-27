import { GroupFolderService } from '../services';
import { Body, BodyParam, Delete, Get, Param, Put, QueryParam, Session } from 'routing-controllers';
import { GroupFolder } from '../entities/mysql';
import { createRepeatName } from '../helpers';

export class GroupFolderController {
  private groupFolderService: GroupFolderService;

  constructor() {
    this.groupFolderService = new GroupFolderService();
  }

  /**
   * 创建团队文件夹
   * @param folder
   * @param parentId
   * @param groupId
   */
  async create(
    @Body() folder: GroupFolder,
    @BodyParam('parentId') parentId: string,
    @BodyParam('groupId') groupId: string
  ) {
    if (parentId !== '0') {
      const parentFolder = await this.groupFolderService.getFoldersByGroupOrParentOrName(groupId, parentId);
      if (parentFolder) {
        return { message: '父级文件夹不存在', code: 1 }
      }
    }
    // 校验重复目录
    const repeatFolder = await this.groupFolderService.getFoldersByGroupOrParentOrName(groupId, parentId, folder.name);
    if (repeatFolder.length) {
      folder.name = createRepeatName(folder.name);
    }
    folder.group = groupId;
    folder.parentId = parentId;
    await this.groupFolderService.create(folder);
    return { message: '创建成功', code: 1 }
  }

  /**
   * 更新目录
   * @param id
   * @param name
   * @param description
   * @param groupId
   */
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @BodyParam('name', {
      required: true
    }) name: string,
    @BodyParam('description') description: string,
    @BodyParam('groupId') groupId: string,
  ) {
    const oldFolder = await this.groupFolderService.getById(id);
    if (!oldFolder) {
      return { message: '文件夹不存在', code: 2 };
    }
    const [repeatFolder] = await this.groupFolderService.getFoldersByGroupOrParentOrName(groupId, id, name);
    if (repeatFolder && repeatFolder.id !== id) {
      name = createRepeatName(name);
    }
    oldFolder.name = name;
    oldFolder.description = description;
    await this.groupFolderService.update(id, oldFolder);
    return { message: '更新成功', code: 1 };
  }

  /**
   * 删除目录
   */
  @Delete('/:id')
  async delete(
    @Param('id') id: string
  ) {
    const oldFolder = await this.groupFolderService.getById(id);
    if (!oldFolder) {
      return { message: '文件夹不存在', code: 2 }
    }
    await this.groupFolderService.remove(id);
    return { message: '删除成功', code: 1 }
  }

  /**
   * 根据文件夹ID获取文件夹信息
   * @param id
   */
  @Get('/:id')
  async getById(@Param('id') id: string) {
    const folder = await this.groupFolderService.getById(id);
    return { message: '获取成功', data: folder, code: 1 }
  }

  /**
   * 根据id获取子文件夹
   * @param groupId
   * @param id
   */
  @Get('/:id/children')
  async getChildren(
    @QueryParam('groupId') groupId: string,
    @Param('id') id: string
  ) {
    const queryGroupId = id === '0' ? groupId : null;
    const folders = await this.groupFolderService.getFoldersByGroupOrParentOrName(queryGroupId, id);
    const parents = await this.groupFolderService.getParents(id);
    return { message: '获取成功', data: { folders, crumbs: parents }, code: 1 }
  }
}
