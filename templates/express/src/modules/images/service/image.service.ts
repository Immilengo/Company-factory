import { ImageOwnerType } from '@prisma/client';
import { prisma } from '@infra/database/prisma';
import { AppError } from '@errors/app-error';

export class ImageService {
  private async validateOwner(ownerType: ImageOwnerType, ownerId: string) {
    if (ownerType === ImageOwnerType.USER) {
      const user = await prisma.user.findUnique({ where: { id: ownerId } });
      if (!user || user.deleted) throw new AppError('Owner user not found', 404);
    }
  }

  private async unsetCurrentPrimary(ownerType: ImageOwnerType, ownerId: string) {
    await prisma.imageAsset.updateMany({
      where: { ownerType, ownerId, primaryImage: true, deleted: false },
      data: { primaryImage: false }
    });
  }

  async create(
    ownerTypeInput: keyof typeof ImageOwnerType,
    ownerId: string,
    input: {
      url: string;
      fileName: string;
      contentType: string;
      sizeBytes: number;
      primaryImage?: boolean;
      sortOrder?: number;
    }
  ) {
    const ownerType = ImageOwnerType[ownerTypeInput];
    if (!ownerType) throw new AppError('Invalid owner type', 400);

    await this.validateOwner(ownerType, ownerId);
    if (input.primaryImage) {
      await this.unsetCurrentPrimary(ownerType, ownerId);
    }

    return prisma.imageAsset.create({
      data: {
        ownerType,
        ownerId,
        url: input.url,
        fileName: input.fileName,
        contentType: input.contentType,
        sizeBytes: BigInt(input.sizeBytes),
        primaryImage: input.primaryImage ?? false,
        sortOrder: input.sortOrder ?? 0
      }
    });
  }

  async list(ownerTypeInput: keyof typeof ImageOwnerType, ownerId: string, recordStatus: 'ACTIVE' | 'INACTIVE' | 'ALL') {
    const ownerType = ImageOwnerType[ownerTypeInput];
    if (!ownerType) throw new AppError('Invalid owner type', 400);

    return prisma.imageAsset.findMany({
      where: {
        ownerType,
        ownerId,
        ...(recordStatus === 'ALL' ? {} : { deleted: recordStatus === 'INACTIVE' })
      },
      orderBy: [{ primaryImage: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }]
    });
  }

  async getPrimary(ownerTypeInput: keyof typeof ImageOwnerType, ownerId: string) {
    const ownerType = ImageOwnerType[ownerTypeInput];
    if (!ownerType) throw new AppError('Invalid owner type', 400);

    return prisma.imageAsset.findFirst({
      where: { ownerType, ownerId, primaryImage: true, deleted: false },
      orderBy: { createdAt: 'asc' }
    });
  }

  async setPrimary(ownerTypeInput: keyof typeof ImageOwnerType, ownerId: string, imageId: string) {
    const ownerType = ImageOwnerType[ownerTypeInput];
    if (!ownerType) throw new AppError('Invalid owner type', 400);

    await this.validateOwner(ownerType, ownerId);
    await this.unsetCurrentPrimary(ownerType, ownerId);

    const image = await prisma.imageAsset.findUnique({ where: { id: imageId } });
    if (!image || image.deleted) throw new AppError('Image not found', 404);

    await prisma.imageAsset.update({ where: { id: imageId }, data: { primaryImage: true } });
  }

  async patchStatus(imageId: string, active: boolean) {
    const image = await prisma.imageAsset.findUnique({ where: { id: imageId } });
    if (!image) throw new AppError('Image not found', 404);

    return prisma.imageAsset.update({ where: { id: imageId }, data: { deleted: !active } });
  }

  async softDelete(imageId: string) {
    const image = await prisma.imageAsset.findUnique({ where: { id: imageId } });
    if (!image || image.deleted) throw new AppError('Image not found', 404);

    await prisma.imageAsset.update({ where: { id: imageId }, data: { deleted: true } });
  }
}
