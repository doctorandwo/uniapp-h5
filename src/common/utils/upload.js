/**
 * @by oh-my-zerone 2026-10-09
 * @description 兼容垫片：OBS 图片上传工具已迁移至 @/common/upload/obs。
 *   本文件保留仅做转发，避免散落或动态引用报错。
 *   新代码请直接：import { chooseAndUploadImagesToHw } from '@/common/upload/obs';
 *   旧名 uploadFileToHw / uploadFileToHwByToolbox 已别名到 uploadImageToHw，兼容存量引用。
 */
export {
    HW_UPLOAD_URL,
    uploadImageToHw,
    uploadFileToHw,
    uploadFileToHwByToolbox,
    chooseAndUploadImagesToHw,
} from '@/common/upload/obs';
